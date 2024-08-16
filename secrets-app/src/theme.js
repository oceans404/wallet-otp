import { ipfsCids } from './ipfsCids';

const colorTheme = {
  brat: {
    color1: '#89CC04',
    color2: 'black',
    text: '#ffffff',
    textHighlight: '#89CC04',
    fallbackPfpIpfsCid: ipfsCids.walletOtpPfp,
  },
  demure: {
    color1: '#ADD8E6',
    color2: '#00008B',
    text: '#ffffff',
    textHighlight: '#ADD8E6',
    fallbackPfpIpfsCid: ipfsCids.walletOtpPfp,
  },
};

export const getThemeData = (theme = 'default') => colorTheme[theme];
