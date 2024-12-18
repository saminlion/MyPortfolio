import { CubismModelSettingJson } from 'live2d/cubismmodelsettingjson';
import { CubismUserModel } from 'live2d/model/cubismusermodel';
import { CubismMatrix44 } from 'live2d/math/cubismmatrix44';
import { CubismRenderer_WebGL } from 'live2d/rendering/cubismrenderer_webgl';
import { CubismMoc } from 'live2d/model/cubismmoc';
import { Live2DCubismFramework as live2dcubismframework, Option as Csm_Option, LogLevel } from 'live2d/live2dcubismframework';
import { CubismMotion } from 'live2d/motion/cubismmotion';
import { CubismMotionManager } from 'live2d/motion/cubismmotionmanager'

export class LAppModel extends CubismUserModel {
    constructor(gl, modelPath, modelFileName, motionPath, motionName) {
        super();
        this.gl = gl;
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

        await this.loadLive2DMotion();

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
            this.motionManager.updateMotion(this.cubismModel, 1/60);
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

    startRenderingLoop() {
        const render = () => {
            this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            for (let i = 0; i < this._textures.length; i++) {
                this._renderer.bindTexture(i, this._textures[i]);
            }

            if (this._model) {
                this.updateModelParameters();
                this._model.update();
                this._renderer.setMvpMatrix(this._projection);
                this._renderer.drawModel();
            }

            requestAnimationFrame(render);
        };

        render();
    }

    updateModelParameters() {
        const now = Date.now() / 1000;

        // Simple animation example
        const parameterCount = this._model.getParameterCount();
        for (let i = 0; i < parameterCount; i++) {
            //const value = Math.sin(now * (i + 1));
//             const amplitude = 10; // 진폭 설정
// const frequency = 2;  // 주파수 설정
// const value = amplitude * Math.sin(now * frequency);
           // this._model.setParameterValueByIndex(i, value);
        }
    }

    resizeCanvas(canvasWidth, canvasHeight) {
        const aspectRatio = canvasWidth / canvasHeight;
        this._projection.loadIdentity();
        this._projection.scale(1, aspectRatio);
    }
}
