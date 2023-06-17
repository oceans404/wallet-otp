const colorTheme = {
  default: {
    color1: '#FF0080',
    color2: '#7928CA',
    text: '#ffffff',
    textHighlight: '#FF0080',
    button: '#7928CA',
    fallbackPfpIpfsCid:
      'bafybeie7nvrlwxqkmvj6e3mse5qdvmsozmghccqd7fdxtck6dbhcxt3le4',
  },
  apecoinDao: {
    color1: '#0035EB',
    color2: '#23BDFF',
    text: '#ffffff',
    textHighlight: '#2556FF',
    button: '#0035EB',
    fallbackPfpIpfsCid:
      'bafkreifmjgv2lmdqxhp6cepq5kmb2i6ozk5c2iabu6nzrsvt7ggwn5wntq',
  },
};

export const getThemeData = (theme = 'default') => colorTheme[theme];
