import {Config} from '@remotion/cli/config';

// x264 con los mismos parametros que usa animador_v9.py, para que la
// comparacion no se contamine con diferencias de codec.
Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setCrf(18);
Config.setChromiumOpenGlRenderer('angle');
