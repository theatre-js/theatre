<template>
  <span class="wrapper">
    <span class="chosen-platform">{{isMac ? 'mac' : 'pc'}}</span>
    {{textForChosenPlatform}}
  </span>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: {
    mac: String,
    pc: String
  },
  beforeMount() {},
  computed: {
    textForChosenPlatform() {
      return this.isMac ? this.mac : this.pc;
    }
  },
  data(opts) {
    const isMac = true;
    return { isMac };
  }
});
</script>

<style scoped>
.wrapper {
  background: #f3f3f3;
  padding: 0 5px;
  position: relative;
}

.chosen-platform {
  font-size: 0.7em;
  font-variant: small-caps;
}
</style>
