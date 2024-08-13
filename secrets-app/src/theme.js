import { ipfsCids } from './ipfsCids';

const colorTheme = {
  default: {
    color1: '#FF0080',
    color2: '#7928CA',
    text: '#ffffff',
    textHighlight: '#FF0080',
    button: '#7928CA',
    fallbackPfpIpfsCid: ipfsCids.walletOtpPfp,
  },
};

export const getThemeData = (theme = 'default') => colorTheme[theme];
