import { CubismModelSettingJson } from 'live2d/cubismmodelsettingjson';
import { CubismUserModel } from 'live2d/model/cubismusermodel';
import { CubismMatrix44 } from 'live2d/math/cubismmatrix44';
import { CubismRenderer_WebGL } from 'live2d/rendering/cubismrenderer_webgl';
import { CubismMoc } from 'live2d/model/cubismmoc';
import { Live2DCubismFramework as live2dcubismframework, Option as Csm_Option, LogLevel } from 'live2d/live2dcubismframework';
import { CubismMotion } from 'live2d/motion/cubismmotion';
import { CubismMotionManager } from 'live2d/motion/cubismmotionmanager';
import { CubismPose } from 'live2d/effect/cubismpose';

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
        this.isInitialized = false;

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
        console.log("Initializing model...");

        try {
            await this.loadAssets();
            await this.setupModel();
            await this.loadPose();
            await this.preloadMotions();
            console.log("Model initialization complete.");
        } catch (error) {
            console.error("Initialization failed:", error);
        }

        this.startRenderingLoop();
    }

    async loadAssets() {
        const response = await fetch(`${this.modelPath}${this.modelFileName}`);
        const arrayBuffer = await response.arrayBuffer();
        this._modelSetting = new CubismModelSettingJson(arrayBuffer, arrayBuffer.byteLength);
    }

    async setupModel() {
        const modelFileName = this._modelSetting.getModelFileName();
        const modelResponse = await fetch(`${this.modelPath}${modelFileName}`);
        const arrayBuffer = await modelResponse.arrayBuffer();

        this._moc = CubismMoc.create(arrayBuffer);
        if (!this._moc) throw new Error("Failed to create CubismMoc");

        this._model = this._moc.createModel();
        if (!this._model) throw new Error("Failed to create CubismModel");

        const texturePromises = [];
        for (let i = 0; i < this._modelSetting.getTextureCount(); i++) {
            const textureFileName = this._modelSetting.getTextureFileName(i);
            if (textureFileName) {
                texturePromises.push(this.loadTexture(i, `${this.modelPath}${textureFileName}`));
            }
        }

        await Promise.all(texturePromises);
        this._renderer.initialize(this._model);
        this._renderer.startUp(this.gl);
        this._renderer.setIsPremultipliedAlpha(true);

        const scale = 2.0; // Adjust for your canvas
        const aspect = this.canvas.width / this.canvas.height;
        this._projection.loadIdentity();
        this._projection.scale(scale, scale * aspect);
        this._renderer.setMvpMatrix(this._projection);

        console.log("Model and textures loaded.");
    }

    async loadPose() {
        const poseResponse = await fetch(`${this.modelPath}${this.poseFileName}`);
        const arrayBuffer = await poseResponse.arrayBuffer();
        this._pose = CubismPose.create(arrayBuffer, arrayBuffer.byteLength);
    }

    async preloadMotions() {
        const motionGroup = "Idle";
        const motionCount = this._modelSetting.getMotionCount(motionGroup);

        for (let i = 0; i < motionCount; i++) {
            const motionFileName = this._modelSetting.getMotionFileName(motionGroup, i);
            const motionResponse = await fetch(`${this.motionPath}${motionFileName}`);
            const arrayBuffer = await motionResponse.arrayBuffer();
            const motion = this.loadMotion(arrayBuffer, arrayBuffer.byteLength, `${motionGroup}_${i}`);
            this._motions.set(`${motionGroup}_${i}`, motion);
        }
    }

    async loadTexture(index, path) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                const texture = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
                this._textures[index] = texture;
                resolve();
            };
            image.onerror = () => reject(`Failed to load texture: ${path}`);
            image.src = path;
        });
    }

    startRenderingLoop() {
        const render = () => {
            this.gl.clearColor(0, 0, 0, 0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            if (this._model) {
                this._renderer.setRenderState(null, [0, 0, this.canvas.width, this.canvas.height]);
                this._renderer.drawModel();
            }

            requestAnimationFrame(render);
        };

        render();
    }
}
