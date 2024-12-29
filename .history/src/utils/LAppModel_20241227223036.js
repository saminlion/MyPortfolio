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
    constructor(canvas, modelPath, modelFileName, motionPath, poseFileName) {
        super();
        this.canvas = canvas;
        this.gl = this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
        this.modelPath = modelPath;
        this.modelFileName = modelFileName;
        this.motionPath = motionPath;
        this.poseFileName = poseFileName;
        this._renderer = new CubismRenderer_WebGL();
        this._projection = new CubismMatrix44();
        this._motions = new Map();
        this.motionManager = new CubismMotionManager();
        this._textures = [];
        this._pose = null;
        this.currentStep = LoadStep.LoadAssets;

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
        console.log('Loading assets...');
        const response = await fetch(`${this.modelPath}${this.modelFileName}`);
        const arrayBuffer = await response.arrayBuffer();
        this._modelSetting = new CubismModelSettingJson(arrayBuffer, arrayBuffer.byteLength);
        console.log('Assets loaded.');
    }

    async loadModel() {
        console.log('Loading model...');
        const modelFileName = this._modelSetting.getModelFileName();
        const response = await fetch(`${this.modelPath}${modelFileName}`);
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
        const texturePromises = [];

        for (let i = 0; i < textureCount; i++) {
            const textureFileName = this._modelSetting.getTextureFileName(i);
            if (textureFileName) {
                const texturePath = `${this.modelPath}${textureFileName}`;
                texturePromises.push(this.loadTexture(i, texturePath));
            }
        }

        await Promise.all(texturePromises);
        console.log('Textures loaded.');
    }

    async loadPose() {
        console.log('Loading pose...');
        const response = await fetch(`${this.modelPath}${this.poseFileName}`);
        const arrayBuffer = await response.arrayBuffer();
        this._pose = CubismPose.create(arrayBuffer, arrayBuffer.byteLength);
        console.log('Pose loaded.');
    }

    async preloadMotions() {
        console.log('Preloading motions...');
        const motionGroup = 'Idle';
        const motionCount = this._modelSetting.getMotionCount(motionGroup);

        for (let i = 0; i < motionCount; i++) {
            const motionFileName = this._modelSetting.getMotionFileName(motionGroup, i);
            const motionPath = `${this.motionPath}${motionFileName}`;
            const response = await fetch(motionPath);
            const arrayBuffer = await response.arrayBuffer();

            const motion = this.loadMotion(arrayBuffer, arrayBuffer.byteLength, `${motionGroup}_${i}`);
            motion.setFadeInTime(1.0);
            motion.setFadeOutTime(1.0);
            this._motions.set(`${motionGroup}_${i}`, motion);
        }

        console.log('Motions preloaded.');
    }

    async loadTexture(index, texturePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const tex = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
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
        const render = () => {
            this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            if (this._model && this._textures.length > 0) {
                for (let i = 0; i < this._textures.length; i++) {
                    this._renderer.bindTexture(i, this._textures[i]);
                }
                this._model.update();
                this.frameBuffer = this.gl.getParameter(this.gl.FRAMEBUFFER_BINDING);
                this._renderer.setRenderState(frameBuffer, [0, 0, this.canvas.width, this.canvas.height]);
                this._renderer.drawModel();
            }

            requestAnimationFrame(render);
        };

        render();
    }
}
