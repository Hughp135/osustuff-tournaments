import { randomFromArray } from './random-from-array';

const allHtml = [
  [
    '<div>wah!</div>',
    '<span>wah!</span>',
    '<p>wah!</p>',
    '<a>wah!</a>',
    '<b>wah!</b>',
    '<i>wah!</i>',
    '<u>wah!</u>',
    '<s>wah!</s>',
    '<title>wah!</title>',
  ],
  [
    '\'\';!--"<wah>=&{()}',
    '<script>alert(\'wah!\')</script>',
    '<base href="javascript:alert(\'wah!\');//">',
    '<bgsound src="javascript:alert(\'wah!\');">',
    '<body background="javascript:alert(\'wah!\');">',
    '<body onload=alert(\'wah!\')>',
    '<div style="background-image:url(javascript:alert(\'wah!\'))">',
    '<frameset><frame src="javascript:alert(\'wah!\');"></frameset>',
    '<iframe src="javascript:alert(\'wah!\');"></iframe>',
    '<input type="image"src="javascript:alert(\'wah!\');">',
    '<img src="javascript:alert(\'wah!\');">',
    '<img src=javascript:alert(\'wah!\')>',
    '<imgdyn src="javascript:alert(\'wah!\');">',
    '<imglow src="javascript:alert(\'wah!\');">',
    '<img src=\'vbscript:msgbox("wah!")\'>',
    '<style type="text/javascript">alert(\'wah!\');</style>',
    '<img style="wah:expr/*wah!*/ession(alert(\'wah!\'))">',
    '<wah style="wah:expression(alert(\'wah!\'))">',
    '<style>.wah{background-image:url("javascript:alert(\'wah!\')");}</style><a class=wah></a>',
    '<style type="text/css">body{background:url("javascript:alert(\'wah!\')")}</style>',
    '<link rel="stylesheet"href="javascript:alert(\'wah!\');">',
    '<table background="javascript:alert(\'wah!\')"></table>',
    '<table><td background="javascript:alert(\'wah!\')"></td></table>',
  ],
  [
    '<a href="https://i.imgur.com/1Bngzv8.png">wah!</a>',
    '<img src="https://i.imgur.com/1Bngzv8.png">',
  ],
];

export function getRandomHtml() {
  return randomFromArray(randomFromArray(allHtml));
}
