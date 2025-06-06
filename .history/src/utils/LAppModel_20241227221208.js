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
    constructor(canvas, modelPath, modelFileName, motionPath, motionName, poseFileName) {
        super();
        this.canvas = canvas;
        this.gl = this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
        this._modelSetting = null;
        this.modelPath = modelPath;
        this.modelFileName = modelFileName;
        this.poseFileName = poseFileName;
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

        // 프레임워크 초기화 추가
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
    
        // 1. Load assets (model, textures)
        await this.loadAssets();
    
        await this.loadPose();

        // 2. Preload motions for the default group (e.g., 'Idle')
        await this.preloadMotion('Idle');
    
        // 3. Start the first motion in the 'Idle' group
        this.startMotion('Idle', 0);
    
        console.log("Model initialization complete.");
    }

    async preloadMotion(group) {
        const motionCount = this._modelSetting.getMotionCount(group);
        console.log(`Preloading motions for group: ${group}, count: ${motionCount}`);
    
        for (let i = 0; i < motionCount; i++) {
            const motionFileName = this._modelSetting.getMotionFileName(group, i);
            const motionPath = `${this.motionPath}${motionFileName}`;
            const name = `${group}_${i}`;
    
            try {
                console.log(`Fetching motion file from: ${motionPath}`);
                const response = await fetch(motionPath);
    
                if (!response.ok) {
                    console.warn(`Failed to fetch motion file: ${motionPath}`);
                    continue;
                }
    
                const contentType = response.headers.get('content-type');
                if (contentType !== 'application/octet-stream') {
                    console.error(`Invalid content type for motion file: ${motionPath}`);
                    //console.log('Response preview:', await response.text());
                    continue;
                }
    
                const arrayBuffer = await response.arrayBuffer();
                const motion = this.loadMotion(arrayBuffer, arrayBuffer.byteLength, name);
    
                if (motion) {
                    motion.setFadeInTime(1.0);
                    motion.setFadeOutTime(1.0);
                    this._motions.set(name, motion);
                    console.log(`Preloaded motion: ${name}`);
                } else {
                    console.warn(`Failed to load motion: ${name}`);
                }
            } catch (error) {
                console.error(`Error preloading motion: ${name}`, error);
            }
        }
    }

    async loadPose()
    {      
          try {
        const response = await fetch(`${this.modelPath}${this.poseFileName}`);
        const arrayBuffer = await response.arrayBuffer();

        this._pose = CubismPose.create(arrayBuffer, arrayBuffer.byteLength);

    } catch (error) {
        console.error('Failed to load assets:', error);
    }
    }

    startMotion(group, index, priority = 1) {
        const name = `${group}_${index}`;
        const motion = this._motions.get(name);

        if (!motion) {
            console.warn(`Motion not found: ${name}`);
            return;
        }

        if (!this.motionManager.reserveMotion(priority)) {
            console.warn(`Motion priority too low: ${name}`);
            return;
        }

        console.log(`Starting motion: ${name}`);
        this.motionManager.startMotionPriority(motion, false, priority);
    }

    async loadAssets() {
        try {
            const response = await fetch(`${this.modelPath}${this.modelFileName}`);
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

            if (textureFileName) {
                const texturePath = `${dir}${textureFileName}`;
                texturePromises.push(this.loadTexture(i, texturePath));
            } else {
                console.warn(`No texture file found for index ${i}`); // 경고 메시지
            }
        }

        await Promise.all(texturePromises);

        console.log('Textures loaded:', this._textures);

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

        // 수정된 부분: 중복 렌더링 방지 설정 초기화
        this.resetPartOpacity();

        console.log('Model and textures loaded successfully.');
        this.startRenderingLoop();

        // 수정된 부분: 중복 렌더링 방지 플래그 설정
        this.isInitialized = true;
    }

    resetPartOpacity() {
        // 중복 렌더링 방지를 위한 파트 불투명도 설정
        if (!this._model) return;

        const partCount = this._model.getPartCount();
        for (let i = 0; i < partCount; i++) {
            const partId = this._model.getPartId(i);
            const partOpacity = this._model.getPartOpacityById(partId);
            if (partOpacity > 1.0) {
                this._model.setPartOpacityById(partId, 1.0);
            }
        }
    }

    async loadTexture(index, texturePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                const tex = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

                this.gl.texImage2D(
                    this.gl.TEXTURE_2D,
                    0,
                    this.gl.RGBA,
                    this.gl.RGBA,
                    this.gl.UNSIGNED_BYTE,
                    img
                );

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

                if (this._pose != null)
                {
                    this._pose.updateParameters(this._model, 1/60);
                }

                else
                {
                    //console.error('No Pose');
                }

                this._model.update();

                if (!this.frameBuffer) {
                    this.frameBuffer = this.gl.getParameter(this.gl.FRAMEBUFFER_BINDING);
                }

                this._renderer.setRenderState(this.frameBuffer, this.size);
                this._renderer.drawModel();
            }

            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            requestAnimationFrame(render);
        };

        render();
    }

    updateModelParameters() {
        if (!this._model) return;

        const { x, y } = this.mousePosition;
        this._model.setParameterValueByIndex(0, x * 30);
        this._model.setParameterValueByIndex(1, y * 30);
        this._model.setParameterValueByIndex(2, x * y * -10);
    }
}
