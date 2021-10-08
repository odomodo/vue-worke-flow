<template>
  <div
    class="node"
    @mousedown="add($event, nodeItem)"
    @mouseup="clearNode($event, nodeItem)"
  >
    <img draggable="false" :src="icon[nodeItem.icon]" />
    <div>{{ nodeItem.label }}</div>
  </div>
</template>

<script>
import { icon } from "./icon/index.js";
import eventBus, {EVENTS} from "@/common/eventBus";
export default {
  name: "Node",
  props: ["nodeItem"],
  data() {
    return {
      icon,
    };
  },
  methods: {
    /**
     * 左区节点鼠标按下事件
     * @argument {DragEvent} event - 鼠标事件
     * @argument {NodeItem} item - 节点数据
     */
    add(event, item) {
      eventBus.$emit(EVENTS.GRAPH_LEFT_NODE_MOUSEDOWN, item)
    },

    /**
     * 左区节点鼠标松开事件
     * @argument {DragEvent} event - 鼠标事件
     */
    clearNode(event, item) {
      eventBus.$emit(EVENTS.GRAPH_LEFT_NODE_MOUSEUP, item)
    },
  },
};
</script>

<style lang="scss" scoped>
.node {
  cursor: grab;
  display: flex;
  flex-flow: column;
  user-select: none;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  img {
    width: 32px;
    height: 32px;
  }
  .text {
    font-size: 14px;
    color: #4a4a4a;
  }
}
</style>
