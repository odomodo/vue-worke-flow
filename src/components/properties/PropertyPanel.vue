<template>
  <div class="property-panel flex-col">
    <div class="title-part">配置信息</div>
    <div class="content-part flex-col">
      <props-editor
        v-if="props.length"
        :props="props"
        :data="mdata"
      ></props-editor>
    </div>
  </div>
</template>
<script>
import { properties } from "../../common/config";
import { deepClone } from "../../utils/tools";
import metadata from "../../common/metadata";
import eventBus, { EVENTS } from "../../common/eventBus";
import propsEditor from "./PropsEditor";
export default {
  components: { propsEditor },
  data() {
    return {
      props: [],
      mdata: metadata.getData(),
    };
  },
  created() {
    //全局监听 节点选中事件
    let callback = (node) => {
      let props;
      if (node) {
        props = deepClone(properties[node.compType]);
        this.mdata =
          node.compType == "sequenceFlow"
            ? metadata.getEdgById(node.id)
            : metadata.getNodeById(node.id);
      } else {
        props = properties.workflow;
        this.mdata = metadata.getRootWorkflow();
      }
      this.props = props;
    };
    eventBus.$on(EVENTS.NODE_SELECTED, callback);
    eventBus.$on(EVENTS.GRAPH_LINE_SELECT, callback);
  },
  methods: {},
};
</script>

<style lang="less" scoped>
.property-panel {
  background: #fff;
  border: 1px solid #eee;
  width: 350px;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  .title-part {
    padding: 5px 10px;
  }
  .content-part {
    overflow-y: auto;
    padding: 10px;
  }
}
</style>
