<template>
  <div class="desinger flex-col flex-grow">
    <section class="flex-row page-header">
      <span class="header-title"> 工作流设计器 </span>
    </section>
    <section class="flex-row flex-grow">
      <div class="comps-panel">
        <el-collapse v-model="activeNames">
          <el-collapse-item
            :title="g.group"
            :name="g.group"
            v-for="g in comps"
            :key="g.group"
          >
            <div class="flex-row flex-grow flex-warp">
              <node
                v-for="(item, index) in g.children"
                class="node-item"
                :node-item="item"
                :key="index"
              >
              </node>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div class="graph-panel flex-col flex-grow">
        <toolbar></toolbar>
        <graph :readonly="readonly" @selectNode="selectNodeHandler"></graph>
      </div>
      <div class="props-panel flex-col">
        <property-panel></property-panel>
      </div>
    </section>
  </div>
</template>

<script>
import { comps } from "../common/config";
import service from "../common/service";
import metadata from "../common/metadata";
import { parser } from "../plugin/xml";
import eventBus, { EVENTS } from "../common/eventBus";
import Node from "../components/Node";

import PropertyPanel from "../components/properties/PropertyPanel";
import Graph from "../components/Graph";
import Toolbar from "../components/Toolbar";
export default {
  name: "Designer",
  components: { Node, PropertyPanel, Graph, Toolbar },
  props: ["params"],
  data() {
    return {
      activeNames: comps[0].group,
      comps,
      readonly: false,
    };
  },
  created() {
    let modelId = this.params.modelId;
    let modelKey = this.params.modelKey;
    if (modelId) {
      service.queryById(modelId).then(({ data }) => {
        parser.xml2Meta(data.xml);
        metadata.getData().modelId = modelId;
        this.defaultNodeSelected()
      });
    } else if (modelKey) {
      service.querymodelbykey(modelKey).then(({ data }) => {
        parser.xml2Meta(data.xml);
        metadata.getData().modelId = data.modelId;
        this.defaultNodeSelected()
      });
    }
  },
  methods: {
    selectNodeHandler(node) {
      eventBus.$emit(EVENTS.NODE_SELECTED, node);
    },
    defaultNodeSelected() {
      const taskKey = this.params.taskKey;
      const currentNode = metadata.getData().nodes.filter(node => node.id === taskKey)
      if (currentNode.length === 1) {
        setTimeout(() => {
          currentNode[0].selected = true
          this.selectNodeHandler(currentNode[0])
        }, 100)
      }
    }
  },
};
</script>
<style lang="scss" scoped>
.header-title {
  line-height: 50px;
  font-size: 16px;
  color: #666;
  font-weight: bold;
}
.desinger {
  margin: 0 10px;
  padding: 0 0 10px 0;
}
.comps-panel {
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 190px;
  height: 100%;
  .node-item {
    width: 45%;
    height: 70px;
    margin: 10px 2.5%;
    box-sizing: border-box;
    border: 1px solid transparent;
    cursor: move;
    &:hover {
      border: 1px dashed #bbb;
    }
  }
}
.graph-panel {
  border: 1px solid #ccc;
  margin: 0 10px;
}
.props-panel {
  flex-shrink: 0;
  border: 1px solid #eee;
}
</style>