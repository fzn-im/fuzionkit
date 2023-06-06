import { css } from 'lit';
export default css`::-webkit-scrollbar {
  width: 14px;
  border-radius: 20px;
}

::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0);
  background-clip: padding-box;
}

::-webkit-scrollbar-track {
  background: #0F1016;
}

* {
  scrollbar-color: #666 #0F1016;
}

@font-face {
  font-family: Montserrat;
  src: url("../fonts/Montserrat-Regular.otf");
}
@font-face {
  font-family: vcr_osd;
  src: url("../fonts/vcr_osd.ttf");
}
html {
  height: 100%;
}

body {
  height: 100%;
  margin: 0;
  padding: 0;
  background: #36393F;
  color: #DEDEDE;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 400;
}

*,
*:before,
*:after {
  box-sizing: border-box;
}

* {
  -webkit-tap-highlight-color: transparent;
}`;
