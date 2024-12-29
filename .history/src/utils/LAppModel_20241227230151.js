import { CubismModelSettingJson } from 'live2d/cubismmodelsettingjson';
import { CubismUserModel } from 'live2d/model/cubismusermodel';
import { CubismMatrix44 } from 'live2d/math/cubismmatrix44';
import { CubismRenderer_WebGL } from 'live2d/rendering/cubismrenderer_webgl';
import { CubismMoc } from 'live2d/model/cubismmoc';
import { Live2DCubismFramework as live2dcubismframework, Option as Csm_Option, LogLevel } from 'live2d/live2dcubismframework';
import { CubismMotion } from 'live2d/motion/cubismmotion';
import { CubismMotionManager } from 'live2d/motion/cubismmotionmanager';
import { CubismPose } from 'live2d/effect/cubismpose';

const LoadStep = {
    LoadAssets: 'LoadAssets',
    LoadModel: 'LoadModel',
    LoadTextures: 'LoadTextures',
    LoadPose: 'LoadPose',
    LoadMotions: 'LoadMotions',
    Complete: 'Complete',
};

export class LAppModel extends CubismUserModel {
    constructor(canvas, modelPath, modelFileName, motionPath, motionFileName, poseFileName) {
        super();
        this.canvas = canvas;
        this.gl = this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
        this.modelPath = modelPath;
        this.modelFileName = modelFileName;
        this.motionFileName = motionFileName;
        this.motionPath = motionPath;
        console.log('poseFileName:', poseFileName);
        this.poseFileName = poseFileName;
        this._renderer = new CubismRenderer_WebGL();
        this._projection = new CubismMatrix44();
        this._motions = new Map();
        this.motionManager = new CubismMotionManager();
        this._textures = [];
        this._pose = null;
        this.currentStep = LoadStep.LoadAssets;
        this.size = [0, 0, this.canvas.width, this.canvas.height];

        this.initFramework();
    }

    initFramework() {
        const cubismOption = new Csm_Option();
        cubismOption.logFunction = console.log;
        cubismOption.loggingLevel = LogLevel.LogLevel_Verbose;

        if (!live2dcubismframework.CubismFramework.isStarted()) {
            const initialized = live2dcubismframework.CubismFramework.startUp(cubismOption);
            if (!initialized) throw new Error('Failed to start Live2D Framework');
            live2dcubismframework.CubismFramework.initialize();
        }
    }

    async initialize() {
        try {
            console.log('Initializing model...');

            await this.loadAssets();
            this.currentStep = LoadStep.LoadModel;

            await this.loadModel();
            this.currentStep = LoadStep.LoadTextures;

            await this.loadTextures();
            this.currentStep = LoadStep.LoadPose;

            await this.loadPose();
            this.currentStep = LoadStep.LoadMotions;

            await this.preloadMotions();
            this.currentStep = LoadStep.Complete;

            console.log('Model initialization complete.');
            this.startRenderingLoop();
        } catch (error) {
            console.error('Initialization failed:', error);
        }
    }

    async loadAssets() {
        console.log(`Loading assets...${this.modelPath} / ${this.modelFileName}`);

        const response = await fetch(`${this.modelPath}${this.modelFileName}`);
        if (!response.ok) throw new Error(`Failed to load model settings: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        this._modelSetting = new CubismModelSettingJson(arrayBuffer, arrayBuffer.byteLength);
        console.log('Assets loaded.');
    }

    async loadModel() {
        console.log(`Loading model...${this.motionPath} / ${this.modelFileName}`);

        const modelFileName = this._modelSetting.getModelFileName();
        const response = await fetch(`${this.modelPath}${modelFileName}`);
        if (!response.ok) throw new Error(`Failed to load model: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();

        this._moc = CubismMoc.create(arrayBuffer);
        if (!this._moc) throw new Error('Failed to create CubismMoc.');

        this._model = this._moc.createModel();
        if (!this._model) throw new Error('Failed to create CubismModel.');

        console.log('Model loaded.');
    }

    async loadTextures() {
        console.log('Loading textures...');
        const textureCount = this._modelSetting.getTextureCount();
        const texturePromises = Array.from({ length: textureCount }, (_, i) => {
            const textureFileName = this._modelSetting.getTextureFileName(i);
            return textureFileName ? this.loadTexture(i, `${this.modelPath}${textureFileName}`) : Promise.resolve();
        });

        await Promise.all(texturePromises);
        console.log('Textures loaded.');
    }

    async loadPose() {
        console.log(`Loading pose...${this.modelPath}${this.poseFileName}`);
    
        const response = await fetch(`${this.modelPath}${this.poseFileName}`);
        if (!response.ok) throw new Error(`Failed to load pose: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        this._pose = CubismPose.create(arrayBuffer, arrayBuffer.byteLength);



        console.log('Pose loaded.');
    }

    async preloadMotions() {
        console.log(`Preloading motions...${this.motionPath}`);

        const motionGroup = 'Idle';
        const motionCount = this._modelSetting.getMotionCount(motionGroup);

        const motionPromises = Array.from({ length: motionCount }, async (_, i) => {
            const motionFileName = this._modelSetting.getMotionFileName(motionGroup, i);
            const motionPath = `${this.motionPath}${motionFileName}`;
            const response = await fetch(motionPath);
            if (!response.ok) throw new Error(`Failed to load motion: ${response.statusText}`);
            const arrayBuffer = await response.arrayBuffer();

            const motion = this.loadMotion(arrayBuffer, arrayBuffer.byteLength, `${motionGroup}_${i}`);
            motion.setFadeInTime(1.0);
            motion.setFadeOutTime(1.0);
            this._motions.set(`${motionGroup}_${i}`, motion);
        });

        await Promise.all(motionPromises);
        console.log('Motions preloaded.');
    }

    async loadTexture(index, texturePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                if (img.width === 0 || img.height === 0) {
                    reject(new Error(`Image at ${texturePath} has invalid dimensions.`));
                    return;
                }

                const tex = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

                // Check for LINEAR_MIPMAP_LINEAR support and fallback if necessary
                const isLinearMipmapSupported = this.gl.getExtension('OES_texture_float') || this.gl.getExtension('OES_texture_half_float');
                const minFilter = isLinearMipmapSupported ? this.gl.LINEAR_MIPMAP_LINEAR : this.gl.LINEAR;
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, minFilter);

                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
                this.gl.generateMipmap(this.gl.TEXTURE_2D);
                this._textures[index] = tex;
                resolve();
            };
            img.onerror = () => reject(new Error(`Failed to load texture: ${texturePath}`));
            img.src = texturePath;
        });
    }

    startRenderingLoop() {
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        const render = () => {
            this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            if (this._model && this._textures.length > 0) {

                //this.updateModelParameters();

                if (this.isIdle) {
                    this.motionManager.updateMotion(this._model, 1 / 60);
                }

                this._textures.forEach((texture, i) => this._renderer.bindTexture(i, texture));
                this._model.update();

                if (!this.frameBuffer) {
                    this.frameBuffer = this.gl.getParameter(this.gl.FRAMEBUFFER_BINDING);
                }

                this._renderer.setRenderState(this.frameBuffer, this.size);
                this._renderer.drawModel();
            }

            requestAnimationFrame(render);
        };

        render();
    }

    destroy() {
        this._textures.forEach(texture => this.gl.deleteTexture(texture));
        this._textures = [];
        if (this._moc) this._moc.release();
        this._moc = null;
    }
}
