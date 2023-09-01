import styled from 'styled-components'

export const DataViewerContainer = styled.div`
  pointer-events: none;
  position: absolute;
  left: 10px;
  top: 18px;
  width: calc(var(--unitSpaceToScaledSpaceMultiplier) * 1px);
  height: 100%;
`

export const SVGContainer = styled.svg`
  margin: 0;
`

export const Polygon = styled.polygon`
  fill: rgba(102, 102, 102, 0.25);
  stroke: #666;
  stroke-width: 1px;
  vector-effect: non-scaling-stroke;
`

export const Rect = styled.rect`
  fill: rgba(102, 102, 102, 0.25);
  stroke: #666;
  stroke-width: 1px;
  vector-effect: non-scaling-stroke;
`

export const Circle = styled.circle`
  r: 1;
  fill: #ccc;
  stroke: none;
  vector-effect: non-scaling-stroke;
`
