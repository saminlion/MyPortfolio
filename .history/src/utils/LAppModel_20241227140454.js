import { CubismModelSettingJson } from 'live2d/cubismmodelsettingjson';
import { CubismUserModel } from 'live2d/model/cubismusermodel';
import { CubismMatrix44 } from 'live2d/math/cubismmatrix44';
import { CubismRenderer_WebGL } from 'live2d/rendering/cubismrenderer_webgl';
import { CubismMoc } from 'live2d/model/cubismmoc';
import { Live2DCubismFramework as live2dcubismframework, Option as Csm_Option, LogLevel } from 'live2d/live2dcubismframework';
import { CubismMotion } from 'live2d/motion/cubismmotion';
import { CubismMotionManager } from 'live2d/motion/cubismmotionmanager';

export class LAppModel extends CubismUserModel {
    constructor(canvas, modelPath, modelFileName, motionPath, motionName) {
        super();
        this.canvas = canvas;
        this.gl = this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
        this._modelSetting = null;
        this.modelPath = modelPath;
        this.modelFileName = modelFileName;
        this._renderer = new CubismRenderer_WebGL();
        this._moc = null;
        this._textures = [];
        this._projection = new CubismMatrix44();
        this._motions = new Map();
        this.motionPath = motionPath;
        this.motionName = motionName;
        this.motionManager = new CubismMotionManager();
        this.size = [0, 0, this.canvas.width, this.canvas.height];
        this.isIdle = false;

        this.mousePosition = { x: 0, y: 0 }; // 마우스 위치 저장

        // 추가된 부분: 중복 렌더링 방지를 위한 상태 플래그
        this.isInitialized = false;
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

    async loadAssets() {
        try {
            this.initFramework();

            const response = await fetch(`${this.modelPath}${this.modelFileName}`);
            console.log('response:', response);
            const arrayBuffer = await response.arrayBuffer();

            const settingJson = new CubismModelSettingJson(arrayBuffer, arrayBuffer.byteLength);

            await this.setupModel(settingJson, this.modelPath);
        } catch (error) {
            console.error('Failed to load assets:', error);
        }
    }

    async setupModel(setting, dir) {
        this._modelSetting = setting;

        this._modelHomeDir = dir;

        // Load model
        const modelFileName = setting.getModelFileName();
        const modelResponse = await fetch(`${dir}${modelFileName}`);
        const modelBuffer = await modelResponse.arrayBuffer();

        this._moc = CubismMoc.create(modelBuffer);
        if (!this._moc) {
            console.error('Failed to create CubismMoc.');
            return;
        }

        this._model = this._moc.createModel();
        if (!this._model) {
            console.error('Failed to create CubismModel.');
            return;
        }
        console.log('Model Loaded:', this._model);

        // Load textures
        const textureCount = this._modelSetting.getTextureCount();
        const texturePromises = [];
        for (let i = 0; i < textureCount; i++) {
            const textureFileName = this._modelSetting.getTextureFileName(i);

            console.log('textureFileName:', textureFileName);

            if (textureFileName) {
                const texturePath = `${dir}${textureFileName}`;
                texturePromises.push(this.loadTexture(i, texturePath));
            } else {
                console.warn(`No texture file found for index ${i}`); // 경고 메시지
            }
        }

        await Promise.all(texturePromises);

        console.log('texturePromises:', texturePromises);

        this._renderer.initialize(this._model);
        this._renderer.startUp(this.gl);
        this._renderer.setIsPremultipliedAlpha(true);

        const scale = 1.0; // 모델의 스케일 값 설정 (큰 값 그대로 유지)
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const aspectRatio = canvasWidth / canvasHeight;

        this._projection.loadIdentity(); // 초기화
        this._projection.scale(scale, scale * aspectRatio);
        this._renderer.setMvpMatrix(this._projection);

        await this.loadLive2DMotion();

        console.log('Model and textures loaded successfully.');
        this.startRenderingLoop();

        // 수정된 부분: 중복 렌더링 방지 플래그 설정
        this.isInitialized = true;
    }

    async loadLive2DMotion() {
        try {
            const idleCount = this._modelSetting.getMotionCount('idle');
            for (let i = 0; i < idleCount; i++) {
                const name = `idle_${i}`;
                const motionFileName = this._modelSetting.getMotionFileName('idle', i);
                const motionFilePath = `${this.motionPath}/${motionFileName}`;

                const response = await fetch(motionFilePath);
                const arrayBuffer = await response.arrayBuffer();

                const motion = this.loadMotion(arrayBuffer, arrayBuffer.byteLength, name);
                motion.setIsLoop(true);

                console.log('motion ch:', motion, name);

                this._motions.set(name, motion); // 수정된 부분
            }

            this.startIdleAnimation();
        } catch (error) {
            console.error('Failed to load Live2D motion:', error);
        }
    }

    startRenderingLoop() {
        const render = () => {
            // 수정된 부분: 중복 렌더링 방지 조건 추가
            if (!this.isInitialized || !this._model || this._textures.some((tex) => !tex)) {
                requestAnimationFrame(render);
                return;
            }

            this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            for (let i = 0; i < this._textures.length; i++) {
                this._renderer.bindTexture(i, this._textures[i]);
            }

            if (this._model) {
                this.updateModelParameters();
                if (this.isIdle) {
                    this.motionManager.updateMotion(this._model, 1 / 60);
                }
                this._model.update();

                if (!this.frameBuffer) {
                    this.frameBuffer = this.gl.getParameter(this.gl.FRAMEBUFFER_BINDING);
                }

                this._renderer.setRenderState(this.frameBuffer, this.size);
                this._renderer.drawModel();
            }

            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null); // 기본 Framebuffer로 복원
            requestAnimationFrame(render);
        };

        render();
    }
}
