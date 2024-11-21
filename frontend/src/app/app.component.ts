import { Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AppModule } from './app.module';
import './highcharts.theme';

const GITHUB_MARK = `
<svg viewBox="0 0 100 100" width="24px" height="24px" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd"
    d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" />
</svg>
`;
const GITHUB_COPILOT_MARK = `
<svg viewBox="0 0 512 416" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd"
  clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2">
  <path
    d="M181.33 266.143c0-11.497 9.32-20.818 20.818-20.818 11.498 0 20.819 9.321 20.819 20.818v38.373c0 11.497-9.321 20.818-20.819 20.818-11.497 0-20.818-9.32-20.818-20.818v-38.373zM308.807 245.325c-11.477 0-20.798 9.321-20.798 20.818v38.373c0 11.497 9.32 20.818 20.798 20.818 11.497 0 20.818-9.32 20.818-20.818v-38.373c0-11.497-9.32-20.818-20.818-20.818z"
    fill-rule="nonzero" />
  <path
    d="M512.002 246.393v57.384c-.02 7.411-3.696 14.638-9.67 19.011C431.767 374.444 344.695 416 256 416c-98.138 0-196.379-56.542-246.33-93.21-5.975-4.374-9.65-11.6-9.671-19.012v-57.384a35.347 35.347 0 016.857-20.922l15.583-21.085c8.336-11.312 20.757-14.31 33.98-14.31 4.988-56.953 16.794-97.604 45.024-127.354C155.194 5.77 226.56 0 256 0c29.441 0 100.807 5.77 154.557 62.722 28.19 29.75 40.036 70.401 45.025 127.354 13.263 0 25.602 2.936 33.958 14.31l15.583 21.127c4.476 6.077 6.878 13.345 6.878 20.88zm-97.666-26.075c-.677-13.058-11.292-18.19-22.338-21.824-11.64 7.309-25.848 10.183-39.46 10.183-14.454 0-41.432-3.47-63.872-25.869-5.667-5.625-9.527-14.454-12.155-24.247a212.902 212.902 0 00-20.469-1.088c-6.098 0-13.099.349-20.551 1.088-2.628 9.793-6.509 18.622-12.155 24.247-22.4 22.4-49.418 25.87-63.872 25.87-13.612 0-27.86-2.855-39.501-10.184-11.005 3.613-21.558 8.828-22.277 21.824-1.17 24.555-1.272 49.11-1.375 73.645-.041 12.318-.082 24.658-.288 36.976.062 7.166 4.374 13.818 10.882 16.774 52.97 24.124 103.045 36.278 149.137 36.278 46.01 0 96.085-12.154 149.014-36.278 6.508-2.956 10.84-9.608 10.881-16.774.637-36.832.124-73.809-1.642-110.62h.041zM107.521 168.97c8.643 8.623 24.966 14.392 42.56 14.392 13.448 0 39.03-2.874 60.156-24.329 9.28-8.951 15.05-31.35 14.413-54.079-.657-18.231-5.769-33.28-13.448-39.665-8.315-7.371-27.203-10.574-48.33-8.644-22.399 2.238-41.267 9.588-50.875 19.833-20.798 22.728-16.323 80.317-4.476 92.492zm130.556-56.008c.637 3.51.965 7.35 1.273 11.517 0 2.875 0 5.77-.308 8.952 6.406-.636 11.847-.636 16.959-.636s10.553 0 16.959.636c-.329-3.182-.329-6.077-.329-8.952.329-4.167.657-8.007 1.294-11.517-6.735-.637-12.812-.965-17.924-.965s-11.21.328-17.924.965zm49.275-8.008c-.637 22.728 5.133 45.128 14.413 54.08 21.105 21.454 46.708 24.328 60.155 24.328 17.596 0 33.918-5.769 42.561-14.392 11.847-12.175 16.322-69.764-4.476-92.492-9.608-10.245-28.476-17.595-50.875-19.833-21.127-1.93-40.015 1.273-48.33 8.644-7.679 6.385-12.791 21.434-13.448 39.665z" />
</svg>
`
const EDITOR_VSCODE = `
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
<path fill-rule="evenodd" clip-rule="evenodd" d="M70.9119 99.3171C72.4869 99.9307 74.2828 99.8914 75.8725 99.1264L96.4608 89.2197C98.6242 88.1787 100 85.9892 100 83.5872V16.4133C100 14.0113 98.6243 11.8218 96.4609 10.7808L75.8725 0.873756C73.7862 -0.130129 71.3446 0.11576 69.5135 1.44695C69.252 1.63711 69.0028 1.84943 68.769 2.08341L29.3551 38.0415L12.1872 25.0096C10.589 23.7965 8.35363 23.8959 6.86933 25.2461L1.36303 30.2549C-0.452552 31.9064 -0.454633 34.7627 1.35853 36.417L16.2471 50.0001L1.35853 63.5832C-0.454633 65.2374 -0.452552 68.0938 1.36303 69.7453L6.86933 74.7541C8.35363 76.1043 10.589 76.2037 12.1872 74.9905L29.3551 61.9587L68.769 97.9167C69.3925 98.5406 70.1246 99.0104 70.9119 99.3171ZM75.0152 27.2989L45.1091 50.0001L75.0152 72.7012V27.2989Z" fill="white"/>
</mask>
<g mask="url(#mask0)">
<path d="M96.4614 10.7962L75.8569 0.875542C73.4719 -0.272773 70.6217 0.211611 68.75 2.08333L1.29858 63.5832C-0.515693 65.2373 -0.513607 68.0937 1.30308 69.7452L6.81272 74.754C8.29793 76.1042 10.5347 76.2036 12.1338 74.9905L93.3609 13.3699C96.086 11.3026 100 13.2462 100 16.6667V16.4275C100 14.0265 98.6246 11.8378 96.4614 10.7962Z" fill="#0065A9"/>
<g filter="url(#filter0_d)">
<path d="M96.4614 89.2038L75.8569 99.1245C73.4719 100.273 70.6217 99.7884 68.75 97.9167L1.29858 36.4169C-0.515693 34.7627 -0.513607 31.9063 1.30308 30.2548L6.81272 25.246C8.29793 23.8958 10.5347 23.7964 12.1338 25.0095L93.3609 86.6301C96.086 88.6974 100 86.7538 100 83.3334V83.5726C100 85.9735 98.6246 88.1622 96.4614 89.2038Z" fill="#007ACC"/>
</g>
<g filter="url(#filter1_d)">
<path d="M75.8578 99.1263C73.4721 100.274 70.6219 99.7885 68.75 97.9166C71.0564 100.223 75 98.5895 75 95.3278V4.67213C75 1.41039 71.0564 -0.223106 68.75 2.08329C70.6219 0.211402 73.4721 -0.273666 75.8578 0.873633L96.4587 10.7807C98.6234 11.8217 100 14.0112 100 16.4132V83.5871C100 85.9891 98.6234 88.1786 96.4586 89.2196L75.8578 99.1263Z" fill="#1F9CF0"/>
</g>
<g style="mix-blend-mode:overlay" opacity="0.25">
<path fill-rule="evenodd" clip-rule="evenodd" d="M70.8511 99.3171C72.4261 99.9306 74.2221 99.8913 75.8117 99.1264L96.4 89.2197C98.5634 88.1787 99.9392 85.9892 99.9392 83.5871V16.4133C99.9392 14.0112 98.5635 11.8217 96.4001 10.7807L75.8117 0.873695C73.7255 -0.13019 71.2838 0.115699 69.4527 1.44688C69.1912 1.63705 68.942 1.84937 68.7082 2.08335L29.2943 38.0414L12.1264 25.0096C10.5283 23.7964 8.29285 23.8959 6.80855 25.246L1.30225 30.2548C-0.513334 31.9064 -0.515415 34.7627 1.29775 36.4169L16.1863 50L1.29775 63.5832C-0.515415 65.2374 -0.513334 68.0937 1.30225 69.7452L6.80855 74.754C8.29285 76.1042 10.5283 76.2036 12.1264 74.9905L29.2943 61.9586L68.7082 97.9167C69.3317 98.5405 70.0638 99.0104 70.8511 99.3171ZM74.9544 27.2989L45.0483 50L74.9544 72.7012V27.2989Z" fill="url(#paint0_linear)"/>
</g>
</g>
<defs>
<filter id="filter0_d" x="-8.39411" y="15.8291" width="116.727" height="92.2456" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
<feOffset/>
<feGaussianBlur stdDeviation="4.16667"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="overlay" in2="BackgroundImageFix" result="effect1_dropShadow"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
</filter>
<filter id="filter1_d" x="60.4167" y="-8.07558" width="47.9167" height="116.151" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
<feOffset/>
<feGaussianBlur stdDeviation="4.16667"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="overlay" in2="BackgroundImageFix" result="effect1_dropShadow"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
</filter>
<linearGradient id="paint0_linear" x1="49.9392" y1="0.257812" x2="49.9392" y2="99.7423" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
</defs>
</svg>
`

const EDITOR_JETBRAINS = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="a" x1=".850001" x2="62.62" y1="62.72" y2="1.81" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FF9419"/>
      <stop offset=".43" stop-color="#FF021D"/>
      <stop offset=".99" stop-color="#E600FF"/>
    </linearGradient>
  </defs>
  <path fill="url(#a)" d="M20.34 3.66 3.66 20.34C1.32 22.68 0 25.86 0 29.18V59c0 2.76 2.24 5 5 5h29.82c3.32 0 6.49-1.32 8.84-3.66l16.68-16.68c2.34-2.34 3.66-5.52 3.66-8.84V5c0-2.76-2.24-5-5-5H29.18c-3.32 0-6.49 1.32-8.84 3.66Z"/>
  <path fill="#000" d="M48 16H8v40h40V16Z"/>
  <path fill="#fff" d="M30 47H13v4h17v-4Z"/>
</svg>
`

const EDITOR_VISUAL_STUDIO = `
<?xml version="1.0" encoding="UTF-8"?> <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 96 95.51"><defs><style>.a{fill:#fff;}.a,.h{fill-rule:evenodd;}.b{mask:url(#a);}.c{fill:#52218a;}.d{fill:#6c33af;}.e{fill:#854cc7;}.f{fill:#b179f1;}.g{opacity:0.25;}.h{fill:url(#b);}</style><mask id="a" x="0" y="0" width="96" height="95.51" maskUnits="userSpaceOnUse"><g transform="translate(0 -0.25)"><path class="a" d="M68.89,95.6a6,6,0,0,0,3.93-.44L92.6,85.65A6,6,0,0,0,96,80.24V15.76a6,6,0,0,0-3.4-5.41L72.82.84A6,6,0,0,0,68.34.55,6,6,0,0,0,66,2L34.12,37.26,15.5,22l-1.63-1.4a4,4,0,0,0-3.61-.83,2.55,2.55,0,0,0-.53.18L2.46,23A4,4,0,0,0,0,26.37c0,.1,0,.2,0,.3V69.33c0,.1,0,.2,0,.3A4,4,0,0,0,2.46,73l7.27,3a2.55,2.55,0,0,0,.53.18,4,4,0,0,0,3.61-.83L15.5,74,34.12,58.74,66,94A6,6,0,0,0,68.89,95.6ZM72,27.68,47.21,48,72,68.32ZM12,34.27,24.41,48,12,61.73Z"></path></g></mask><linearGradient id="b" x1="48" y1="97.75" x2="48" y2="2.25" gradientTransform="matrix(1, 0, 0, -1, 0, 98)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"></stop><stop offset="1" stop-color="#fff" stop-opacity="0"></stop></linearGradient></defs><title>BrandVisualStudioWin2019</title><g class="b"><path class="c" d="M13.87,75.4a4,4,0,0,1-4.14.65L2.46,73A4,4,0,0,1,0,69.33V26.67A4,4,0,0,1,2.46,23l7.27-3a4,4,0,0,1,4.14.65L15.5,22A2.21,2.21,0,0,0,12,23.8V72.2A2.21,2.21,0,0,0,15.5,74Z" transform="translate(0 -0.25)"></path><path class="d" d="M2.46,73A4,4,0,0,1,0,69.33V69a2.31,2.31,0,0,0,4,1.55L66,2A6,6,0,0,1,72.82.84L92.6,10.36A6,6,0,0,1,96,15.77V16a3.79,3.79,0,0,0-6.19-2.93L15.5,74l-1.63,1.4a4,4,0,0,1-4.14.65Z" transform="translate(0 -0.25)"></path><path class="e" d="M2.46,23A4,4,0,0,0,0,26.67V27a2.31,2.31,0,0,1,4-1.55L66,94a6,6,0,0,0,6.82,1.16L92.6,85.64A6,6,0,0,0,96,80.23V80a3.79,3.79,0,0,1-6.19,2.93L15.5,22l-1.63-1.4A4,4,0,0,0,9.73,20Z" transform="translate(0 -0.25)"></path><path class="f" d="M72.82,95.16A6,6,0,0,1,66,94a3.52,3.52,0,0,0,6-2.49v-87A3.52,3.52,0,0,0,66,2,6,6,0,0,1,72.82.84L92.6,10.35A6,6,0,0,1,96,15.76V80.24a6,6,0,0,1-3.4,5.41Z" transform="translate(0 -0.25)"></path><g class="g"><path class="h" d="M68.89,95.6a6,6,0,0,0,3.93-.44L92.6,85.65A6,6,0,0,0,96,80.24V15.76a6,6,0,0,0-3.4-5.41L72.82.84A6,6,0,0,0,68.34.55,6,6,0,0,0,66,2L34.12,37.26,15.5,22l-1.63-1.4a4,4,0,0,0-3.61-.83,2.55,2.55,0,0,0-.53.18L2.46,23A4,4,0,0,0,0,26.37c0,.1,0,.2,0,.3V69.33c0,.1,0,.2,0,.3A4,4,0,0,0,2.46,73l7.27,3a2.55,2.55,0,0,0,.53.18,4,4,0,0,0,3.61-.83L15.5,74,34.12,58.74,66,94A6,6,0,0,0,68.89,95.6ZM72,27.68,47.21,48,72,68.32ZM12,34.27,24.41,48,12,61.73Z" transform="translate(0 -0.25)"></path></g></g></svg> 
`

const EDITOR_XCODE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><linearGradient id="xcode-original-a" gradientUnits="userSpaceOnUse" x1="63.947" y1="114.165" x2="63.947" y2="13.784"><stop offset="0" stop-color="#1578e4"/><stop offset="1" stop-color="#00c3f2"/></linearGradient><path d="M35.7 13.8h56.5c12.1 0 21.9 9.8 21.9 21.9v56.5c0 12.1-9.8 21.9-21.9 21.9H35.7c-12.1 0-21.9-9.8-21.9-21.9V35.7c0-12.1 9.8-21.9 21.9-21.9z" fill="url(#xcode-original-a)"/><path fill="#FFF" d="M90.5 19.2H37.4c-10.1 0-18.3 8.2-18.3 18.3v53.1c0 10.1 8.2 18.3 18.3 18.3h53.1c10.1 0 18.3-8.2 18.3-18.3V37.4c0-10.1-8.2-18.2-18.3-18.2zm16.8 71.6c0 9.2-7.4 16.6-16.6 16.6H37.2c-9.1 0-16.6-7.4-16.6-16.6V37.2c0-9.2 7.4-16.6 16.6-16.6h53.6c9.1 0 16.6 7.4 16.6 16.6v53.6z"/><path d="M64.1 22.8c-22.6 0-41 18.4-41 41s18.4 41 41 41c22.7 0 41-18.4 41-41s-18.4-41-41-41zm0 81.4c-22.3 0-40.4-18.1-40.4-40.4s18.1-40.4 40.4-40.4c22.3 0 40.4 18.1 40.4 40.4s-18.1 40.4-40.4 40.4z" fill="#69c5f3"/><path d="M64.1 31.2c-18.1 0-32.7 14.6-32.7 32.7S46 96.5 64.1 96.5s32.7-14.6 32.7-32.7-14.7-32.6-32.7-32.6zm0 64.6c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.4 32-32 32z" fill="#68c5f4"/><path fill="#FFF" d="M32.8 71.3h62.4c2.6 0 4.6 2.1 4.6 4.6 0 2.6-2.1 4.6-4.6 4.6H32.8c-2.6 0-4.6-2.1-4.6-4.6-.1-2.5 2-4.6 4.6-4.6z"/><path d="M32.6 72.2h62.6c2 0 3.7 1.6 3.7 3.7v.1c0 2-1.6 3.7-3.7 3.7H32.6c-2 0-3.7-1.6-3.7-3.7v-.2c.1-2 1.7-3.6 3.7-3.6z" fill="#0a93e9"/><path d="M31.1 79.3h65.7l.5-.3H30.6l.5.3z" fill="#1694ea"/><path d="M29.6 78.1h68.6l.2-.3h-69l.2.3z" fill="#319dec"/><path d="M29 76.2h69.9v-.4H29v.4z" fill="#65b1ee"/><path d="M29.7 73.7h68.6l.1.2.1.2h-69l.1-.2.1-.2z" fill="#8ec6f3"/><path d="M31.2 72.5h65.6l.3.1.3.2H30.6l.3-.2.3-.1z" fill="#95caf3"/><linearGradient id="xcode-original-b" gradientUnits="userSpaceOnUse" x1="94.037" y1="79.666" x2="94.037" y2="72.184"><stop offset="0" stop-color="#1492e7"/><stop offset="1" stop-color="#dbedfb"/></linearGradient><path d="M93.4 72.2h-.5s1.7 1.2 1.7 3.9c0 2.5-1.7 3.6-1.7 3.6h.5s1.7-.8 1.7-3.6c0-3-1.7-3.9-1.7-3.9z" fill="url(#xcode-original-b)"/><linearGradient id="xcode-original-c" gradientUnits="userSpaceOnUse" x1="89.042" y1="79.666" x2="89.042" y2="72.184"><stop offset="0" stop-color="#1492e7"/><stop offset="1" stop-color="#dbedfb"/></linearGradient><path d="M88.6 72.2h-.5s1.5 1.4 1.5 3.9c0 2.2-1.5 3.6-1.5 3.6h.5s1.5-1.1 1.5-3.6c-.1-2.7-1.5-3.9-1.5-3.9z" fill="url(#xcode-original-c)"/><linearGradient id="xcode-original-d" gradientUnits="userSpaceOnUse" x1="63.947" y1="79.666" x2="63.947" y2="72.184"><stop offset="0" stop-color="#1492e7"/><stop offset="1" stop-color="#dbedfb"/></linearGradient><path d="M63.7 72.2h.5v7.5h-.5v-7.5z" fill="url(#xcode-original-d)"/><linearGradient id="xcode-original-e" gradientUnits="userSpaceOnUse" x1="58.952" y1="79.666" x2="58.952" y2="72.184"><stop offset="0" stop-color="#1492e7"/><stop offset="1" stop-color="#dbedfb"/></linearGradient><path d="M58.8 72.2h.5s-.2 1.9-.2 3.9c0 1.8.2 3.6.2 3.6h-.5s-.2-1.8-.2-3.6c0-2 .2-3.9.2-3.9z" fill="url(#xcode-original-e)"/><linearGradient id="xcode-original-f" gradientUnits="userSpaceOnUse" x1="53.958" y1="79.666" x2="53.958" y2="72.184"><stop offset="0" stop-color="#1492e7"/><stop offset="1" stop-color="#dbedfb"/></linearGradient><path d="M54 72.2h.5s-.5 1.9-.5 3.9c0 1.8.5 3.6.5 3.6H54s-.5-1.8-.5-3.6c0-2 .5-3.9.5-3.9z" fill="url(#xcode-original-f)"/><linearGradient id="xcode-original-g" gradientUnits="userSpaceOnUse" x1="48.963" y1="79.666" x2="48.963" y2="72.184"><stop offset="0" stop-color="#1492e7"/><stop offset="1" stop-color="#dbedfb"/></linearGradient><path d="M49.1 72.2h.5s-.7 1.9-.7 3.9c0 1.8.7 3.6.7 3.6h-.5s-.7-1.8-.7-3.6c0-2 .7-3.9.7-3.9z" fill="url(#xcode-original-g)"/><linearGradient id="xcode-original-h" gradientUnits="userSpaceOnUse" x1="43.968" y1="79.666" x2="43.968" y2="72.184"><stop offset="0" stop-color="#1492e7"/><stop offset="1" stop-color="#dbedfb"/></linearGradient><path d="M44.2 72.2h.5s-1 1.6-1 3.9c0 2 1 3.6 1 3.6h-.5s-1-1.6-1-3.6c0-2.3 1-3.9 1-3.9z" fill="url(#xcode-original-h)"/><linearGradient id="xcode-original-i" gradientUnits="userSpaceOnUse" x1="38.852" y1="79.666" x2="38.852" y2="72.184"><stop offset="0" stop-color="#1492e7"/><stop offset="1" stop-color="#dbedfb"/></linearGradient><path d="M39.3 72.2h.5s-1.5 1.4-1.5 3.9c0 2.2 1.5 3.6 1.5 3.6h-.5s-1.5-1.1-1.5-3.6c.1-2.7 1.5-3.9 1.5-3.9z" fill="url(#xcode-original-i)"/><linearGradient id="xcode-original-j" gradientUnits="userSpaceOnUse" x1="33.857" y1="79.666" x2="33.857" y2="72.184"><stop offset="0" stop-color="#1492e7"/><stop offset="1" stop-color="#dbedfb"/></linearGradient><path d="M34.5 72.2h.5s-1.7 1.2-1.7 3.9c0 2.5 1.7 3.6 1.7 3.6h-.5s-1.7-.8-1.7-3.6c0-3 1.7-3.9 1.7-3.9z" fill="url(#xcode-original-j)"/><path fill="#FFF" d="M62 34.1l31.2 54c1.3 2.2.5 5-1.7 6.3-2.2 1.3-5 .5-6.3-1.7L54 38.7c-1.3-2.2-.5-5 1.7-6.3 2.2-1.3 5-.5 6.3 1.7z"/><linearGradient id="xcode-original-k" gradientUnits="userSpaceOnUse" x1="73.58" y1="94.25" x2="73.58" y2="32.642"><stop offset="0" stop-color="#1285e7"/><stop offset="1" stop-color="#00b5ef"/></linearGradient><path d="M61.2 34.5l31.3 54.2c1 1.7.4 4-1.3 5l-.2.1c-1.7 1-4 .4-5-1.3L54.7 38.2c-1-1.7-.4-4 1.3-5l.1-.1c1.8-1 4.1-.4 5.1 1.4z" fill="url(#xcode-original-k)"/><linearGradient id="xcode-original-l" gradientUnits="userSpaceOnUse" x1="87.464" y1="93.978" x2="54.081" y2="36.156"><stop offset="0" stop-color="#2b90e7"/><stop offset="1" stop-color="#00b6ef"/></linearGradient><path d="M54.2 36.7L87 93.6l.2.1.2.1.2.1-33.4-57.8v.6z" fill="url(#xcode-original-l)"/><linearGradient id="xcode-original-m" gradientUnits="userSpaceOnUse" x1="89.073" y1="94.327" x2="54.583" y2="34.589"><stop offset="0" stop-color="#3795ea"/><stop offset="1" stop-color="#49c4f2"/></linearGradient><path d="M54.5 34.8l34.3 59.4h.4L54.7 34.5l-.1.2-.1.1z" fill="url(#xcode-original-m)"/><linearGradient id="xcode-original-n" gradientUnits="userSpaceOnUse" x1="91.026" y1="93.735" x2="56.072" y2="33.193"><stop offset="0" stop-color="#3696ea"/><stop offset="1" stop-color="#90d9f6"/></linearGradient><path d="M55.9 33.3l35 60.5.3-.2-35-60.5-.3.2z" fill="url(#xcode-original-n)"/><linearGradient id="xcode-original-o" gradientUnits="userSpaceOnUse" x1="92.582" y1="92.332" x2="58.065" y2="32.547"><stop offset="0" stop-color="#3097ea"/><stop offset="1" stop-color="#b5e5f9"/></linearGradient><path d="M58.4 32.7L92.6 92l-.1.2-.1.2-34.5-59.8h.2l.3.1z" fill="url(#xcode-original-o)"/><linearGradient id="xcode-original-p" gradientUnits="userSpaceOnUse" x1="93.083" y1="90.686" x2="59.741" y2="32.936"><stop offset="0" stop-color="#3a98ea"/><stop offset="1" stop-color="#bce7fa"/></linearGradient><path d="M60.2 33.3L93 90.1v.6L59.6 33l.2.1.2.1.2.1z" fill="url(#xcode-original-p)"/><path fill="#3c98ea" d="M91.5 86.9l-.2-.4s-.2 2-2.4 3.4c-2.1 1.3-4 .4-4 .4l.2.4s1.6 1.1 4-.4c2.4-1.4 2.4-3.4 2.4-3.4zM89 82.7l-.2-.4s-.5 2-2.6 3.2c-1.9 1.2-3.8.6-3.8.6l.2.4s1.7.7 3.9-.6c2.2-1.3 2.5-3.2 2.5-3.2z"/><path d="M86.6 78.5l-.2-.4s-.9 1.7-2.8 2.8c-1.7 1-3.6 1-3.6 1l.2.4s1.8 0 3.6-1c1.9-1.1 2.8-2.8 2.8-2.8z" fill="#4ca4ed"/><path d="M84.2 74.3l-.2-.4s-1.3 1.7-3 2.6c-1.6.9-3.5 1.2-3.5 1.2l.2.4s1.9-.3 3.5-1.2c1.6-.9 3-2.6 3-2.6z" fill="#4da7ee"/><linearGradient id="xcode-original-q" gradientUnits="userSpaceOnUse" x1="67.981" y1="61.226" x2="74.457" y2="57.487"><stop offset="0" stop-color="#00a4ec"/><stop offset="1" stop-color="#b9dff6"/></linearGradient><path d="M74.3 57.3l.2.4s-1.7.8-3.4 1.7c-1.6.9-3 2.1-3 2.1l-.2-.4s1.5-1.2 3-2.1c1.7-.9 3.4-1.7 3.4-1.7z" fill="url(#xcode-original-q)"/><linearGradient id="xcode-original-r" gradientUnits="userSpaceOnUse" x1="65.487" y1="56.906" x2="71.962" y2="53.167"><stop offset="0" stop-color="#00a4ec"/><stop offset="1" stop-color="#b9dff6"/></linearGradient><path d="M71.9 53.1l.2.4s-1.9.6-3.5 1.6c-1.6.9-2.9 2.3-2.9 2.3l-.2-.4s1.3-1.4 2.9-2.3c1.6-1.1 3.5-1.6 3.5-1.6z" fill="url(#xcode-original-r)"/><path d="M67.4 49.8c1.3-.4 2.3-.6 2.3-.6l-.2-.4s-.9.1-1.9.5c-.6.2-.7.7-.2.5z" fill="#9dd4f7"/><linearGradient id="xcode-original-s" gradientUnits="userSpaceOnUse" x1="57.93" y1="43.819" x2="64.364" y2="40.105"><stop offset="0" stop-color="#00b4ef"/><stop offset="1" stop-color="#c3e9fa"/></linearGradient><path d="M64.6 40.5l.2.4s-1.9-.5-4.1.7c-1.9 1.2-2.3 3.1-2.3 3.1l-.2-.4s.2-1.7 2.3-3c2.2-1.4 4.1-.8 4.1-.8z" fill="url(#xcode-original-s)"/><linearGradient id="xcode-original-t" gradientUnits="userSpaceOnUse" x1="55.424" y1="39.477" x2="61.9" y2="35.738"><stop offset="0" stop-color="#00b4ef"/><stop offset="1" stop-color="#c3e9fa"/></linearGradient><path d="M62.2 36.2l.3.4s-2-.8-4.3.5C56 38.5 56 40.4 56 40.4l-.3-.4s-.2-1.7 2.2-3.2c2.5-1.5 4.3-.6 4.3-.6z" fill="url(#xcode-original-t)"/><path fill="#FFF" d="M55.5 71.3c8.7-15 18.7-32.4 18.7-32.4 1.3-2.2.5-5-1.7-6.3-2.2-1.3-5-.5-6.3 1.7 0 0-12.2 21.2-21.4 37h10.7zm-5.4 9.2C45.9 87.7 43 92.9 43 92.9c-1.3 2.2-4.1 3-6.3 1.7s-3-4.1-1.7-6.3c0 0 1.7-3.1 4.4-7.7 3.4-.1 9.6-.1 10.7-.1z"/><linearGradient id="xcode-original-u" gradientUnits="userSpaceOnUse" x1="54.566" y1="94.401" x2="54.566" y2="32.794"><stop offset="0" stop-color="#1285e7"/><stop offset="1" stop-color="#00b5ef"/></linearGradient><path d="M54.4 71.3c8.8-15.2 19-32.9 19-32.9 1-1.7.4-4-1.3-5l-.1-.1c-1.7-1-4-.4-5 1.3 0 0-12 20.8-21.2 36.7h8.6zm-5.3 9.2c-4 7-6.9 12-6.9 12-1 1.7-3.2 2.3-5 1.3H37c-1.7-1-2.3-3.2-1.3-5 0 0 1.9-3.3 4.8-8.3h8.6z" fill="url(#xcode-original-u)"/><linearGradient id="xcode-original-v" gradientUnits="userSpaceOnUse" x1="40.681" y1="94.131" x2="74.064" y2="36.311"><stop offset="0" stop-color="#3194e9"/><stop offset="1" stop-color="#71cff4"/></linearGradient><path d="M54.1 71.3L74 36.9v-.6s-11 19.1-20.2 35h.3zm-5.4 9.2l-7.6 13.2-.3.2-.3.1s3.4-5.9 7.8-13.5h.4z" fill="url(#xcode-original-v)"/><linearGradient id="xcode-original-w" gradientUnits="userSpaceOnUse" x1="39.063" y1="94.482" x2="73.557" y2="34.736"><stop offset="0" stop-color="#5aa6ec"/><stop offset="1" stop-color="#a2def8"/></linearGradient><path d="M52.6 71.3l21-36.3-.1-.2-.1-.2S61.9 54.5 52.3 71.2l.3.1zm-5.3 9.2l-8 13.8h-.4s3.4-5.9 8-13.9c.2.1.4.1.4.1z" fill="url(#xcode-original-w)"/><linearGradient id="xcode-original-x" gradientUnits="userSpaceOnUse" x1="37.118" y1="93.885" x2="72.072" y2="33.343"><stop offset="0" stop-color="#66abee"/><stop offset="1" stop-color="#bee8fa"/></linearGradient><path d="M50.4 71.3c9.9-17.1 21.8-37.8 21.8-37.8l-.3-.2-22 38h.5zM45 80.6C40.6 88.3 37.3 94 37.3 94l-.3-.2s3.2-5.6 7.6-13.2c.2-.1.1-.1.4 0z" fill="url(#xcode-original-x)"/><linearGradient id="xcode-original-y" gradientUnits="userSpaceOnUse" x1="35.568" y1="92.482" x2="70.085" y2="32.697"><stop offset="0" stop-color="#7bb6f0"/><stop offset="1" stop-color="#b1e3f9"/></linearGradient><path d="M48 71.3c9.9-17.1 22.2-38.5 22.2-38.5h-.4S57.5 54.1 47.6 71.3h.4zm-5.8 9.2c-4 6.9-6.7 11.6-6.7 11.6l.1.2.1.2s2.9-5 7-12h-.5z" fill="url(#xcode-original-y)"/><linearGradient id="xcode-original-z" gradientUnits="userSpaceOnUse" x1="35.056" y1="90.872" x2="68.415" y2="33.092"><stop offset="0" stop-color="#5aa6ec"/><stop offset="1" stop-color="#afe3f9"/></linearGradient><path d="M46.5 71.3l22-38.1-.2.1-.2.1-.1.1S55.8 54.6 46.2 71.3h.3zm-5.3 9.2c-3.5 6.1-6 10.4-6 10.4v-.8s2.2-3.8 5.6-9.7c.2.1.2.1.4.1z" fill="url(#xcode-original-z)"/><linearGradient id="xcode-original-A" gradientUnits="userSpaceOnUse" x1="66.362" y1="35.689" x2="72.838" y2="39.428"><stop offset="0" stop-color="#c1e7fa"/><stop offset="1" stop-color="#89d4f5"/></linearGradient><path d="M66 36.2l-.2.4s1.8-.9 4.2.4c2.2 1.2 2.3 3.3 2.3 3.3l.2-.4s.2-1.9-2.3-3.3-4.2-.4-4.2-.4z" fill="url(#xcode-original-A)"/><linearGradient id="xcode-original-B" gradientUnits="userSpaceOnUse" x1="63.856" y1="40.03" x2="70.332" y2="43.768"><stop offset="0" stop-color="#c1e7fa"/><stop offset="1" stop-color="#89d4f5"/></linearGradient><path d="M63.6 40.5l-.2.4s2-.6 4.1.6c2 1.1 2.4 3 2.4 3l.2-.4s-.2-1.8-2.4-3c-2.3-1.3-4.1-.6-4.1-.6z" fill="url(#xcode-original-B)"/><linearGradient id="xcode-original-C" gradientUnits="userSpaceOnUse" x1="61.273" y1="44.505" x2="67.748" y2="48.243"><stop offset="0" stop-color="#c1e7fa"/><stop offset="1" stop-color="#89d4f5"/></linearGradient><path d="M61.1 44.7l-.2.4s1.8-.1 3.8 1.1c1.8 1 2.7 2.6 2.7 2.6l.2-.4s-.9-1.6-2.7-2.6c-1.9-1.1-3.8-1.1-3.8-1.1z" fill="url(#xcode-original-C)"/><linearGradient id="xcode-original-D" gradientUnits="userSpaceOnUse" x1="58.761" y1="48.855" x2="65.236" y2="52.594"><stop offset="0" stop-color="#b0dff8"/><stop offset="1" stop-color="#52bdf2"/></linearGradient><path d="M58.7 49l-.2.4s2 .3 3.7 1.3c1.6.9 2.8 2.4 2.8 2.4l.2-.4s-1.2-1.5-2.8-2.4c-1.7-1-3.7-1.3-3.7-1.3z" fill="url(#xcode-original-D)"/><linearGradient id="xcode-original-E" gradientUnits="userSpaceOnUse" x1="56.25" y1="53.204" x2="62.727" y2="56.943"><stop offset="0" stop-color="#b4def8"/><stop offset="1" stop-color="#4eb5f0"/></linearGradient><path d="M56.2 53.2l-.2.4s1.9.5 3.6 1.5c1.6.9 2.9 2.2 2.9 2.2l.2-.4s-1.3-1.3-2.9-2.2c-1.6-.9-3.6-1.5-3.6-1.5z" fill="url(#xcode-original-E)"/><linearGradient id="xcode-original-F" gradientUnits="userSpaceOnUse" x1="53.74" y1="57.553" x2="60.215" y2="61.291"><stop offset="0" stop-color="#b4def8"/><stop offset="1" stop-color="#4eb5f0"/></linearGradient><path d="M53.8 57.4l-.3.4s1.8.7 3.5 1.7c1.6.9 3 2 3 2l.2-.4s-1.4-1.1-3-2c-1.6-.9-3.4-1.7-3.4-1.7z" fill="url(#xcode-original-F)"/><linearGradient id="xcode-original-G" gradientUnits="userSpaceOnUse" x1="51.239" y1="61.886" x2="57.713" y2="65.624"><stop offset="0" stop-color="#b5ddf8"/><stop offset="1" stop-color="#46aeee"/></linearGradient><path d="M51.1 62.1l.2-.4 6.5 3.7-.2.4-6.5-3.7z" fill="url(#xcode-original-G)"/><linearGradient id="xcode-original-H" gradientUnits="userSpaceOnUse" x1="48.735" y1="66.22" x2="55.211" y2="69.959"><stop offset="0" stop-color="#96cef4"/><stop offset="1" stop-color="#46aaee"/></linearGradient><path d="M48.7 66.4l.2-.4s1.6 1.2 3.3 2.1c1.6.9 3.2 1.6 3.2 1.6l-.2.3s-1.7-.7-3.3-1.6c-1.7-.9-3.2-2-3.2-2z" fill="url(#xcode-original-H)"/><path d="M47.1 71.3c-.5-.4-.8-.7-.8-.7l.2-.4s.6.5 1.4 1.1h-.8z" fill="#73b9f1"/><linearGradient id="xcode-original-I" gradientUnits="userSpaceOnUse" x1="42.719" y1="80.135" x2="47.681" y2="83"><stop offset="0" stop-color="#8fc1f2"/><stop offset="1" stop-color="#3193ea"/></linearGradient><path d="M43.2 80.5c.4.3.8.6 1.3.9 1.8 1 3.6.9 3.6.9l-.2.4s-1.8.1-3.6-.9c-.7-.4-1.3-.9-1.7-1.3h.6z" fill="url(#xcode-original-I)"/><linearGradient id="xcode-original-J" gradientUnits="userSpaceOnUse" x1="38.634" y1="83.717" x2="45.11" y2="87.456"><stop offset="0" stop-color="#8fc1f2"/><stop offset="1" stop-color="#3193ea"/></linearGradient><path d="M38.9 83.3l.2-.4s.5 2 2.7 3.2c2 1.1 3.8.5 3.8.5l-.2.4s-1.6.7-3.8-.5c-2.3-1.3-2.7-3.2-2.7-3.2z" fill="url(#xcode-original-J)"/><linearGradient id="xcode-original-K" gradientUnits="userSpaceOnUse" x1="36.124" y1="88.063" x2="42.599" y2="91.802"><stop offset="0" stop-color="#8fc1f2"/><stop offset="1" stop-color="#3193ea"/></linearGradient><path d="M36.4 87.6l.2-.4s.2 2.1 2.6 3.4c2.2 1.2 3.9.3 3.9.3l-.3.4s-1.5 1.1-3.9-.3c-2.5-1.4-2.5-3.4-2.5-3.4z" fill="url(#xcode-original-K)"/><linearGradient id="xcode-original-L" gradientUnits="userSpaceOnUse" x1="76.722" y1="64.933" x2="89.179" y2="71.008"><stop offset=".001"/><stop offset="1" stop-opacity="0"/></linearGradient><path d="M68.8 114.2l42.8-89.9-10.8-5.1-44.6 93.5s1.4.7 3.2 1.5h9.4z" fill="url(#xcode-original-L)"/><radialGradient id="xcode-original-M" cx="95.237" cy="25.132" r="16.181" fx="79.585" fy="25.974" gradientTransform="matrix(-.4494 .8933 -1.5457 -.7777 176.886 -40.4)" gradientUnits="userSpaceOnUse"><stop offset="0"/><stop offset="1" stop-opacity="0"/></radialGradient><path d="M94.1 13.8l20 9.5V52C107.2 48.7 61 26.7 61 26.7s3.2-6.7 6.2-12.9h26.9z" fill="url(#xcode-original-M)"/><radialGradient id="xcode-original-N" cx="51.211" cy="114.953" r="7.901" fx="51.196" fy="117.292" gradientTransform="matrix(.8979 .4402 -.2506 .5111 34.032 33.662)" gradientUnits="userSpaceOnUse"><stop offset=".417" stop-color="#0c0c12"/><stop offset="1" stop-color="#3d4651"/></radialGradient><path d="M44.5 110.2c-.3.6-.8 1.3-.7 2.4.1 4.1 6.8 7.9 10.7 7.9 2.7 0 3.6-1.1 4.6-3.1s-13.5-9.6-14.6-7.2z" fill="url(#xcode-original-N)"/><linearGradient id="xcode-original-O" gradientUnits="userSpaceOnUse" x1="84.758" y1="39.174" x2="94.522" y2="44.149"><stop offset="0" stop-color="#344351"/><stop offset=".1" stop-color="#9697a0"/><stop offset=".181" stop-color="#8b8c95"/><stop offset=".351" stop-color="#787a83"/><stop offset=".47" stop-color="#71747d"/><stop offset=".591" stop-color="#777982"/><stop offset=".749" stop-color="#87898f"/><stop offset=".8" stop-color="#8e8f94"/><stop offset=".849" stop-color="#3d3b42"/><stop offset=".9" stop-color="#606e84"/></linearGradient><path d="M90.6 25.1s10.3 2.5 11.1 3.2-1.3 4.7-1.7 5.3c-3.3 4-13.6 26.1-13.6 26.1l-9.5-5.4s8.5-15.8 11.5-21.4c1.9-3.8 2.2-7.8 2.2-7.8z" fill="url(#xcode-original-O)"/><linearGradient id="xcode-original-P" gradientUnits="userSpaceOnUse" x1="117.884" y1="29.257" x2="106.863" y2="14.364"><stop offset=".27" stop-color="#262b33"/><stop offset=".45" stop-color="#74747e"/><stop offset=".54" stop-color="#b0b0bc"/><stop offset=".73" stop-color="#74747e"/></linearGradient><path d="M114.4 19.9c1.8 1.3 4.2 1 6.1.7 1.3-.2-.7 1.7-2.9 6.1s-2.1 4.7-2.4 4.4c-.3-.3-10.2-5.9-9.9-6.4.4-.5 2-11.4 2.8-11.1 2.9.7 3.4 4.2 6.3 6.3z" fill="url(#xcode-original-P)"/><linearGradient id="xcode-original-Q" gradientUnits="userSpaceOnUse" x1="98.542" y1="30.424" x2="114.815" y2="28.322"><stop offset=".14" stop-color="#606e84"/><stop offset=".4" stop-color="#9899a5"/><stop offset=".73" stop-color="#475768"/><stop offset=".92" stop-color="#262b33"/></linearGradient><path d="M99 32.2c.7-1.1 3.9-7.9 9-7.9 2.3 0 6.7 5.8 7.1 6.6.3.7-.7 3.5-1.2 2.2-.6-1.5-3.1-4.7-5.8-4.7s-6.4 3.1-7.3 4.2c-.9 1-2.5.7-1.8-.4z" fill="url(#xcode-original-Q)"/><linearGradient id="xcode-original-R" gradientUnits="userSpaceOnUse" x1="106.128" y1="31.808" x2="104.549" y2="22.854"><stop offset="0" stop-color="#101215" stop-opacity=".1"/><stop offset=".46" stop-color="#101215" stop-opacity=".7"/><stop offset=".7" stop-color="#474951"/><stop offset=".91" stop-color="#7b7d88"/></linearGradient><path d="M98.8 31.8c.5-.8 2.8-4.3 3.9-5.4s3.9-4 6.3-4.4c2.4-.4 4.9 4.5 4.1 5.5-.6.7-1.6-.1-2.8-1.1-1.2-.9-2-2.7-5.8.2-1.3 1-2.6 1.8-5.6 6.1-.8 1.1-.6-.1-.1-.9z" fill="url(#xcode-original-R)"/><linearGradient id="xcode-original-S" gradientUnits="userSpaceOnUse" x1="58.131" y1="81.721" x2="73.237" y2="89.154"><stop offset=".115" stop-color="#2c3952"/><stop offset=".374" stop-color="#3d414e"/><stop offset=".55" stop-color="#474a54"/><stop offset=".754" stop-color="#4e5057"/><stop offset=".892" stop-color="#323945"/><stop offset="1" stop-color="#143052"/></linearGradient><path d="M86.4 61c.4-.8.9-2-.2-2.9-1.2-.9-6.8-3.9-7.8-4.1-1-.2-1.8 0-2.2.7-.4.7-31.1 53.3-31.7 54.8-.6 1.5-.7 2.6.2 2.9.9.3 11.2 5.2 12.2 6.3 1 1.1 1.5-.1 1.9-.7 1.9-2.4 27.1-56.2 27.6-57z" fill="url(#xcode-original-S)"/><linearGradient id="xcode-original-T" gradientUnits="userSpaceOnUse" x1="81.508" y1="31.679" x2="93.19" y2="6.047"><stop offset=".118" stop-color="#6d7078" stop-opacity="0"/><stop offset=".2" stop-color="#6d7078" stop-opacity=".7"/><stop offset=".34" stop-color="#35363a"/><stop offset=".374" stop-color="#1d1f22"/><stop offset=".4" stop-color="#101215"/><stop offset=".5" stop-color="#16171a"/><stop offset=".56" stop-color="#292a2e"/><stop offset=".688" stop-color="#4b4d51"/><stop offset=".807" stop-color="#63666b"/><stop offset=".915" stop-color="#72757b"/><stop offset="1" stop-color="#777a80"/></linearGradient><path d="M99.5 31.6c.5-.7 1.7-2.7 3.2-4.5 1-1.2 6.4-3.8 7.6-8 .7-2.3-.4-4.6-1.9-5.6-5.1-3.1-13.9-8-26.8-8-8.7 0-12.4 2.9-12.4 2.9h4.4l15.3 6 1.9 8s.2 2.7-.7 5.8c-.6 2.5-.8 4-1.7 6.5.7.3 2.3-.8 4.1-.3 1.6.4 2.6 2.6 3.7 1.3 1.9-2.5 2.5-3 3.3-4.1z" fill="url(#xcode-original-T)"/><linearGradient id="xcode-original-U" gradientUnits="userSpaceOnUse" x1="69.064" y1="16.837" x2="91.026" y2="16.837"><stop offset="0" stop-color="#4a4d56"/><stop offset="1" stop-color="#29292d"/></linearGradient><path d="M90.5 25.4C89.7 18 87.9 11 69.1 11.1c1.2-1.2 4.1-2.4 4.1-2.4l-4.1-.3s.6-.5 1.8-.6c11-.9 20.8 1.4 20.1 15.7-.1 2.3-.3 3.3-.5 1.9z" fill="url(#xcode-original-U)"/><linearGradient id="xcode-original-V" gradientUnits="userSpaceOnUse" x1="69.064" y1="11.697" x2="88.054" y2="11.697"><stop offset="0" stop-color="#767880"/><stop offset=".41" stop-color="#0c0a0b"/></linearGradient><path d="M69.1 11.1c1.3-.5 3.1-.8 6.5-.6 4.2.2 9.5 1.8 11.7 3.8 1.1 1 1 .2-.2-1.1-3.1-3.6-7.8-4.4-13.9-4.5-.7-.1-3 1.2-4.1 2.4z" fill="url(#xcode-original-V)"/><linearGradient id="xcode-original-W" gradientUnits="userSpaceOnUse" x1="116.332" y1="34.756" x2="123.707" y2="21.982"><stop offset="0" stop-color="#858997"/><stop offset=".23" stop-color="#244668"/><stop offset=".282" stop-color="#1a3249"/><stop offset=".4" stop-color="#040506"/><stop offset=".464" stop-color="#313236"/><stop offset=".546" stop-color="#65656e"/><stop offset=".607" stop-color="#868691"/><stop offset=".64" stop-color="#92929e"/></linearGradient><path d="M120.7 20.6l5.5 2.8s-2.1 2.8-3.8 6c-1.8 3.4-3 7.1-3 7.1l-5.3-3.2s1.3-3.6 3.2-7.1c1.5-2.9 3.4-5.6 3.4-5.6z" fill="url(#xcode-original-W)"/><path d="M126.2 23.4c.4.2-.9 3.3-2.8 6.9-1.9 3.6-3.7 6.4-4 6.2-.4-.2.9-3.3 2.8-6.9 1.8-3.6 3.6-6.4 4-6.2z" fill="#bfc0d0"/></svg>
`

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AppModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'GitHub Value';
  iconRegistry: MatIconRegistry;
  sanitizer: DomSanitizer;

  constructor() {
    this.iconRegistry = inject(MatIconRegistry);
    this.sanitizer = inject(DomSanitizer);

    this.iconRegistry.addSvgIconLiteral('github', this.sanitizer.bypassSecurityTrustHtml(GITHUB_MARK));
    this.iconRegistry.addSvgIconLiteral('github-copilot', this.sanitizer.bypassSecurityTrustHtml(GITHUB_COPILOT_MARK));
    this.iconRegistry.addSvgIconLiteral('editor-vscode', this.sanitizer.bypassSecurityTrustHtml(EDITOR_VSCODE));
    this.iconRegistry.addSvgIconLiteral('editor-jetbrains', this.sanitizer.bypassSecurityTrustHtml(EDITOR_JETBRAINS));
    this.iconRegistry.addSvgIconLiteral('editor-visual-studio', this.sanitizer.bypassSecurityTrustHtml(EDITOR_VISUAL_STUDIO));
    this.iconRegistry.addSvgIconLiteral('editor-xcode', this.sanitizer.bypassSecurityTrustHtml(EDITOR_XCODE));
  }
}
