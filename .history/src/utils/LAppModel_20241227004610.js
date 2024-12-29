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

        this.motionPath = motionPath;
        this.motionName = motionName;
        this.motionManager = new CubismMotionManager();

        this.isIdle = false;

        this.mousePosition = { x: 0, y: 0 }; // 마우스 위치 저장
        this.frameBuffer = null;
        this.size = [0, 0, this.canvas.width, this.canvas.height];
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

            if (textureFileName) {
                const texturePath = `${dir}${textureFileName}`;
                texturePromises.push(this.loadTexture(i, texturePath));
            } else {
                console.warn(`No texture file found for index ${i}`);
            }
        }

        await Promise.all(texturePromises);

        this._renderer.initialize(this._model);
        this._renderer.startUp(this.gl);
        this._renderer.setIsPremultipliedAlpha(true);

        const scale = 1.0;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const aspectRatio = canvasWidth / canvasHeight;

        this._projection.loadIdentity();
        this._projection.scale(scale, scale * aspectRatio);
        this._renderer.setMvpMatrix(this._projection);

        this.createFrameBuffer(); // Framebuffer 생성
        this.startRenderingLoop();
    }

    createFrameBuffer() {
        const { gl } = this;

        this.frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.canvas.width,
            this.canvas.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            texture,
            0
        );

        const depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.canvas.width, this.canvas.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            console.error('Framebuffer is not complete:', status);
        }
        
        console.log('Framebuffer status:', gl.checkFramebufferStatus(gl.FRAMEBUFFER));

        gl.bindFramebuffer(gl.FRAMEBUFFER, null); // 기본 상태로 복원
    }

    startRenderingLoop() {
        const render = () => {
            if (!this._model || this._textures.some((tex) => !tex)) {
                console.error('Model or textures are not fully loaded.');
                requestAnimationFrame(render);
                return;
            }

            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

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
               this._renderer.setRenderState(this.frameBuffer, this.size);
                this._renderer.drawModel();
            }

            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null); // 기본 Framebuffer로 복원
            requestAnimationFrame(render);
        };

        render();
    }

    async loadTexture(index, texturePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                const tex = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
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

    updateModelParameters() {
        if (!this._model) return;

        const { x, y } = this.mousePosition;

        this._model.setParameterValueByIndex(0, x * 30);
        this._model.setParameterValueByIndex(1, y * 30);
        this._model.setParameterValueByIndex(2, x * y * -10);
    }

    updateMousePosition(x, y) {
        this.isIdle = false;
        this.mousePosition.x = x;
        this.mousePosition.y = y;
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

            //console.log("In Start");

            fetch(motionFilePath)
                .then((response) => response.arrayBuffer())
                .then((arrayBuffer) => {
                    const motion = this.loadMotion(arrayBuffer, arrayBuffer.byteLength, idleMotionName);
                    if (motion) {
                        motion.setFadeInTime(1.0);
                        motion.setFadeOutTime(1.0);
                        motion.setIsLoop(true);

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
}
