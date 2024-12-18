import { CubismModelSettingJson } from 'live2d/cubismmodelsettingjson';
import { CubismUserModel } from 'live2d/model/cubismusermodel';
import { CubismMatrix44 } from 'live2d/math/cubismmatrix44';
import { CubismRenderer_WebGL } from 'live2d/rendering/cubismrenderer_webgl';
import { CubismMoc } from 'live2d/model/cubismmoc';
import { Live2DCubismFramework as live2dcubismframework, Option as Csm_Option, LogLevel } from 'live2d/live2dcubismframework';
import { CubismMotion } from 'live2d/motion/cubismmotion';
import { CubismMotionManager } from 'live2d/motion/cubismmotionmanager'

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

        this.motionPath = motionPath
        this.motionName = motionName
        this.motionManager = new CubismMotionManager();

        this.isIdle = false;

        this.mousePosition = { x: 0, y: 0 }; // 마우스 위치 저장
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

            const setting = new CubismModelSettingJson(arrayBuffer, arrayBuffer.byteLength);
            await this.setupModel(setting, this.modelPath);
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
            const texturePath = `${dir}${textureFileName}`;
            texturePromises.push(this.loadTexture(i, texturePath));
        }

        await Promise.all(texturePromises);

        this._renderer.initialize(this._model);
        this._renderer.startUp(this.gl);
        this._renderer.setIsPremultipliedAlpha(true);

        const scale = 3.0; // 모델의 스케일 값 설정 (큰 값 그대로 유지)
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const aspectRatio = canvasWidth / canvasHeight;

        this._projection.loadIdentity(); // 초기화
        this._projection.scale(scale, scale * aspectRatio);
        this._renderer.setMvpMatrix(this._projection);

       // await this.loadLive2DMotion();

        //  console.log('Model and textures loaded successfully.');
        this.startRenderingLoop();
    }

    async loadLive2DMotion() {
        try {
            const motionFilePath = `${this.motionPath}/${this.motionName}.motion3.json`;

            const response = await fetch(motionFilePath);
            if (!response.ok) throw new Error(`Failed to load motion file: ${response.statusText}`);

            console.log('motionResponse:', response);

            const arrayBuffer = await response.arrayBuffer();

            //const motion = CubismMotion.create(arrayBuffer, arrayBuffer.byteLength);

            const motion = this.loadMotion(arrayBuffer, arrayBuffer.byteLength, this.motionName);

            if (!motion) throw new Error('Failed to create motion. Motion data might be invalid.');

            //motion.setEffectIds(this.eyeBlinkIds, this.lipSyncIds);
            motion.setFadeInTime(1.0);
            motion.setFadeOutTime(1.0);
            motion.setIsLoop(true);

            console.log('Motion Loaded:', motion);

            // 모션 관리 클래스 초기화 및 재생
            if (!this.motionManager) {
                this.motionManager = new CubismMotionManager();
            }

            const motionHandle = this.motionManager.startMotionPriority(motion, true, 2);
            if (motionHandle === -1) {
                throw new Error('Failed to start motion. Invalid motion handle.');
            }

            if (motionHandle === -1) {
                console.error('Failed to start motion: Invalid handle.');
            }

            // let time = 1 / 60;
            //this.motionManager.startMotionPriority(motion, false, 2);
        }
        catch (error) {
            console.error('Failed to load Live2D motion:', error);
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
                this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);

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

    startIdleAnimation() {
        try {
            let idleMotionName = "";
            
            if (this.motionName) {
                idleMotionName = this.motionName;
            }
            else {
                idleMotionName = '00_idle'; // Idle 애니메이션 이름
            }
            const motionFilePath = `${this.motionPath}/${this.motionName}.motion3.json`;

            fetch(motionFilePath)
                .then((response) => response.arrayBuffer())
                .then((arrayBuffer) => {
                    const motion = this.loadMotion(arrayBuffer, arrayBuffer.byteLength, idleMotionName);
                    if (motion) {
                        this.motionManager.startMotionPriority(motion, true, 1);

                        this.isIdle = true;

                    } else {
                        console.error('Failed to start idle motion.');
                    }
                });
        } catch (error) {
            console.error('Error starting idle animation:', error);
        }
    }

    stopIdleAnimation() {
        
    }

    startRenderingLoop() {
        const render = () => {
            this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            for (let i = 0; i < this._textures.length; i++) {
                this._renderer.bindTexture(i, this._textures[i]);
            }

            if (this._model) {
                this.updateModelParameters();
                if (this.isIdle)
                {
                this.motionManager.updateMotion(this._model, 1/60);
                }
                this._model.update();
                //this._renderer.setMvpMatrix(this._projection);
                this._renderer.drawModel();
            }

            requestAnimationFrame(render);
        };

        render();
    }

    updateModelParameters() {
        if (!this._model) return;

        const { x, y } = this.mousePosition;

        this._model.addParameterValueByIndex(
            0,
            x * 30
        );
        this._model.addParameterValueByIndex(
            1,
            y * 30
        );
        this._model.addParameterValueByIndex(
            2,
            x * y * -10
        );
    }

    updateMousePosition(x, y) {
        this.mousePosition.x = x;
        this.mousePosition.y = y;
    }
}
