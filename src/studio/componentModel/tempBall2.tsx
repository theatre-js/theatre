import './tempBall.css'
import {scaleY, translationY} from './points'

export default {
  "IntroScene": {
    "__descriptorType": "DeclarativeComponentDescriptor",
    "id": "IntroScene",
    "displayName": "IntroScene",
    "type": "Declarative",
    "listOfRulesets": [],
    "ruleSetsById": {},
    "timelineDescriptors": {
      "byId": {
        "timeline1": {
          "__descriptorType": "TimelineDescriptor",
          "id": "timeline1",
          "variables": {
            "ballY": {
              "__descriptorType": "TimelineVarDescriptor",
              "id": "ballY",
              "component": "Ball",
              "property": "Y",
              "extremums": [
                -1000,
                100
              ],
              "points": [
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "0",
                  "time": 900,
                  "value": 0,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "2",
                  "time": 1524.7270888067724,
                  "value": -100,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.2758509493312434,
                      0.3678929765886288
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "4",
                  "time": 2160,
                  "value": 0,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.3384851269953416,
                      0.1839464882943144,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "time": 2400,
                  "value": 0,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.393072040029943,
                      0.4089219330855019,
                      0.5,
                      0
                    ]
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "6",
                  "time": 3051.4204532421136,
                  "value": -110,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.5424403426797233,
                      0,
                      0.4,
                      0.2920870950610727
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "8",
                  "time": 3650,
                  "value": 0,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "time": 3950,
                  "value": 0,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4152115295250978,
                      0.17992565055762083,
                      0.5,
                      0
                    ]
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "10",
                  "time": 4588.897961342271,
                  "value": -140,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.5706212500242197,
                      0,
                      0.3620584923429349,
                      0.16356877323420074
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "12",
                  "time": 5140,
                  "value": 0,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "time": 5500,
                  "value": 0,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.329561146973387,
                      0.09200743494423792,
                      0.6162220333405235,
                      0
                    ]
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "14",
                  "time": 6128.810266821325,
                  "value": -200,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.7038611390066916,
                      0,
                      0.36138833073448484,
                      0.19423791821561337
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "16",
                  "time": 6690,
                  "value": 0,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "time": 7060,
                  "value": 0,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.46140723919849097,
                      0.06691449814126393,
                      0.5,
                      0
                    ]
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "18",
                  "time": 7661.464687228348,
                  "value": -210,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.41905639973976494,
                      0.07434944237918215
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "20",
                  "time": 8230,
                  "value": 0,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.37318702386019714,
                      4.529411764705873,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "time": 8687.469044081228,
                  "value": 0,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4172821355153792,
                      3.19595420908175,
                      0.4479827328102388,
                      -6.103150488746566
                    ]
                  }
                },
                {
                  "time": 9747.399702823179,
                  "value": -38,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.3083766012367585,
                      0.6817234232620875,
                      0.45855386370380924,
                      -0.01643186893113463
                    ]
                  }
                },
                {
                  "time": 11114.29047808198,
                  "value": -150,
                  "interpolationDescriptor": {
                    "connected": false,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.5,
                      0,
                      0.5,
                      0
                    ]
                  }
                },
                {
                  "time": 12471.520554730065,
                  "value": -150,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.3834355828220859,
                      0.3175158539252132,
                      0.5,
                      0
                    ]
                  }
                },
                {
                  "time": 14086.181277860327,
                  "value": -1000,
                  "interpolationDescriptor": {
                    "connected": false,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.5,
                      0,
                      0.5,
                      0
                    ]
                  }
                }
              ]
            },
            "ballScaleY": {
              "__descriptorType": "TimelineVarDescriptor",
              "id": "ballScaleY",
              "component": "Ball",
              "property": "ScaleY",
              "extremums": [
                -0.5,
                1.5
              ],
              "points": [
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "0",
                  "time": 0,
                  "value": 1,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "time": 700,
                  "value": 0.65,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.5,
                      0,
                      0.5,
                      0
                    ]
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "1",
                  "time": 758.4899672871979,
                  "value": 0.65,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "2",
                  "time": 1100,
                  "value": 1.2,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "3",
                  "time": 1519.379112785129,
                  "value": 1,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "4",
                  "time": 2070,
                  "value": 1.2,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4115979013716891,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "5",
                  "time": 2280.345367833361,
                  "value": 0.65,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4050023391730367,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "6",
                  "time": 2450,
                  "value": 1.2,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "7",
                  "time": 3041.234513331292,
                  "value": 1,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "8",
                  "time": 3600,
                  "value": 1.2,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "9",
                  "time": 3826.350160178932,
                  "value": 0.65,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "10",
                  "time": 3980,
                  "value": 1.2,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "11",
                  "time": 4587.239305676863,
                  "value": 1,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "12",
                  "time": 5100,
                  "value": 1.2,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "13",
                  "time": 5357.304322289361,
                  "value": 0.6,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "14",
                  "time": 5550,
                  "value": 1.2,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "15",
                  "time": 6120.31500615066,
                  "value": 1,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "16",
                  "time": 6630,
                  "value": 1.2,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.49894125339856776,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "17",
                  "time": 6890.11420699599,
                  "value": 0.51,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.6514542170869707,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "18",
                  "time": 7100,
                  "value": 1.2,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "19",
                  "time": 7651.003352493921,
                  "value": 1,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "__descriptorType": "TimelineVarPoint",
                  "id": "20",
                  "time": 8170,
                  "value": 1.2,
                  "interpolationDescriptor": {
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.4,
                      0,
                      0.4,
                      0
                    ],
                    "connected": true
                  }
                },
                {
                  "time": 8514.007308160779,
                  "value": 0.9,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.5,
                      0,
                      0.5,
                      0
                    ]
                  }
                },
                {
                  "time": 8810.703666997028,
                  "value": 1,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.5,
                      0,
                      0.5,
                      0
                    ]
                  }
                },
                {
                  "time": 9113.422486379395,
                  "value": 1.1,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.5,
                      0,
                      0.5,
                      0
                    ]
                  }
                },
                {
                  "time": 9648.340762753838,
                  "value": 1,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.5,
                      0,
                      0.5,
                      0
                    ]
                  }
                },
                {
                  "time": 10797.424467558198,
                  "value": 1,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.5,
                      0,
                      0.5,
                      0
                    ]
                  }
                },
                {
                  "time": 20000,
                  "value": 1,
                  "interpolationDescriptor": {
                    "connected": false,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.5,
                      0,
                      0.5,
                      0
                    ]
                  }
                }
              ]
            },
            "31a11928-21ba-4ff3-ac4e-5e539da7fd43": {
              "__descriptorType": "TimelineVarDescriptor",
              "id": "31a11928-21ba-4ff3-ac4e-5e539da7fd43",
              "component": "div.ball",
              "property": "rotateZ",
              "extremums": [
                -150,
                1000
              ],
              "points": [
                {
                  "time": 8643.387815750371,
                  "value": 0,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.1558654723008649,
                      0.3294573643410853,
                      0.5,
                      0
                    ]
                  }
                },
                {
                  "time": 10916.295195641407,
                  "value": 120,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.5,
                      0,
                      0.5,
                      0
                    ]
                  }
                },
                {
                  "time": 14016.840019811789,
                  "value": 919.7674418604652,
                  "interpolationDescriptor": {
                    "connected": false,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.5,
                      0,
                      0.5,
                      0
                    ]
                  }
                }
              ]
            },
            "be793921-9d7f-4d7b-9029-3500491c2b8e": {
              "__descriptorType": "TimelineVarDescriptor",
              "id": "be793921-9d7f-4d7b-9029-3500491c2b8e",
              "component": "div.ball",
              "property": "translationX",
              "extremums": [
                -150,
                150
              ],
              "points": [
                {
                  "time": 8613.655422005797,
                  "value": 0,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.5,
                      0,
                      0.42035705600390044,
                      0.35778175313059035
                    ]
                  }
                },
                {
                  "time": 11100,
                  "value": 78,
                  "interpolationDescriptor": {
                    "connected": true,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.3670295025985113,
                      3.6830299592636484,
                      0.3558962452966138,
                      4.878048780487799
                    ]
                  }
                },
                {
                  "time": 13719.663199603765,
                  "value": 55,
                  "interpolationDescriptor": {
                    "connected": false,
                    "__descriptorType": "TimelinePointInterpolationDescriptor",
                    "interpolationType": "CubicBezier",
                    "handles": [
                      0.5,
                      0,
                      0.5,
                      0
                    ]
                  }
                }
              ]
            },
            "c5602007-3bfd-46cb-b363-f8702c45ac26": {
              "__descriptorType": "TimelineVarDescriptor",
              "id": "c5602007-3bfd-46cb-b363-f8702c45ac26",
              "component": "div.ball",
              "property": "scaleX",
              "extremums": [
                -150,
                150
              ],
              "points": []
            }
          },
          "layout": [
            "box1",
            "box2",
            "5f3ee9ee-0e7c-4564-bd15-a23002004d67",
            "e5db74c1-7ff4-4a4b-9da3-2960daf2cd8c"
          ],
          "boxes": {
            "box1": {
              "id": "box1",
              "height": 283,
              "variables": [
                "ballY"
              ]
            },
            "box2": {
              "id": "box2",
              "height": 100,
              "variables": [
                "ballScaleY"
              ]
            },
            "5f3ee9ee-0e7c-4564-bd15-a23002004d67": {
              "id": "5f3ee9ee-0e7c-4564-bd15-a23002004d67",
              "height": 100,
              "variables": [
                "31a11928-21ba-4ff3-ac4e-5e539da7fd43"
              ]
            },
            "e5db74c1-7ff4-4a4b-9da3-2960daf2cd8c": {
              "id": "e5db74c1-7ff4-4a4b-9da3-2960daf2cd8c",
              "height": 100,
              "variables": [
                "be793921-9d7f-4d7b-9029-3500491c2b8e"
              ]
            }
          }
        }
      },
      "list": [
        "timeline1"
      ]
    },
    "localHiddenValuesById": {
      "fontSize": "18px",
      "container": {
        "__descriptorType": "ComponentInstantiationValueDescriptor",
        "componentId": "TheaterJS/Core/HTML/div",
        "props": {
          "class": "container",
          "key": "container",
          "children": [
            {
              "__descriptorType": "ReferenceToLocalHiddenValue",
              "which": "8f69e8f5-77c3-4b9c-9864-e14c004f7e89"
            }
          ]
        },
        "modifierInstantiationDescriptors": {
          "byId": {
            "1": {
              "__descriptorType": "ModifierInstantiationValueDescriptor",
              "modifierId": "TheaterJS/Core/HTML/UberModifier",
              "props": {
                "translationX": "0",
                "translationY": "0",
                "translationZ": "0",
                "opacity": "1",
                "scaleX": "1",
                "scaleY": "1",
                "scaleZ": "1",
                "rotateX": "0",
                "rotateY": "0",
                "rotateZ": "0"
              },
              "enabled": true
            }
          },
          "list": [
            "1"
          ]
        }
      },
      "8f69e8f5-77c3-4b9c-9864-e14c004f7e89": {
        "__descriptorType": "ComponentInstantiationValueDescriptor",
        "props": {
          "key": "8f69e8f5-77c3-4b9c-9864-e14c004f7e89",
          "children": [
            {
              "__descriptorType": "ReferenceToLocalHiddenValue",
              "which": "571bb924-7a12-4c8a-aa30-b256b118ae20"
            }
          ],
          "class": "scene"
        },
        "modifierInstantiationDescriptors": {
          "byId": {
            "2": {
              "__descriptorType": "ModifierInstantiationValueDescriptor",
              "modifierId": "TheaterJS/Core/HTML/UberModifier",
              "props": {
                "translationX": "0",
                "translationY": "0",
                "opacity": "1",
                "translationZ": "0",
                "scaleX": "1",
                "scaleY": "1",
                "scaleZ": "1",
                "rotateX": "0",
                "rotateY": "0",
                "rotateZ": "0"
              },
              "enabled": true
            }
          },
          "list": [
            "2"
          ]
        },
        "componentId": "TheaterJS/Core/HTML/div"
      },
      "571bb924-7a12-4c8a-aa30-b256b118ae20": {
        "__descriptorType": "ComponentInstantiationValueDescriptor",
        "props": {
          "key": "571bb924-7a12-4c8a-aa30-b256b118ae20",
          "children": [],
          "class": "ball"
        },
        "modifierInstantiationDescriptors": {
          "byId": {
            "1": {
              "__descriptorType": "ModifierInstantiationValueDescriptor",
              "modifierId": "TheaterJS/Core/HTML/UberModifier",
              "props": {
                "translationX": {
                  "__descriptorType": "ReferenceToTimelineVar",
                  "timelineId": "timeline1",
                  "varId": "be793921-9d7f-4d7b-9029-3500491c2b8e"
                },
                "translationY": {
                  "__descriptorType": "ReferenceToTimelineVar",
                  "timelineId": "timeline1",
                  "varId": "ballY"
                },
                "translationZ": "0",
                "opacity": "1",
                "scaleX": "1",
                "scaleY": {
                  "__descriptorType": "ReferenceToTimelineVar",
                  "timelineId": "timeline1",
                  "varId": "ballScaleY"
                },
                "scaleZ": "1",
                "rotateX": "0",
                "rotateY": "0",
                "rotateZ": {
                  "__descriptorType": "ReferenceToTimelineVar",
                  "timelineId": "timeline1",
                  "varId": "31a11928-21ba-4ff3-ac4e-5e539da7fd43"
                }
              },
              "enabled": true
            }
          },
          "list": [
            "1"
          ]
        },
        "componentId": "TheaterJS/Core/HTML/div"
      }
    },
    "whatToRender": {
      "__descriptorType": "ReferenceToLocalHiddenValue",
      "which": "container"
    },
    "meta": {
      "composePanel": {
        "selectedNodeId": "571bb924-7a12-4c8a-aa30-b256b118ae20"
      }
    }
  }
}