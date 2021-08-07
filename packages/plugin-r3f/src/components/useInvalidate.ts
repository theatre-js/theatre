import {useThree} from '@react-three/fiber'

export default function useInvalidate() {
  return useThree(({invalidate}) => invalidate)
}
