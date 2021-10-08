<template>
  <g
    v-if="node"
    class="node-container"
    :class="{'selected': node.selected}"
    :transform="'translate(' + node.x + ',' + node.y + ')'"
    draggable
    @mousedown="nodemousedown($event, node)"
    @click="goSubProcess"
  >

    <image v-if="readonly&&isCanceledWorkflow&&node['compType']=='startEvent'" :x="0" :y="-16" :width="16" :height="16" :xlink:href="icon['canceled']"></image>
    <image v-if="readonly&&!isCanceledWorkflow&&isFinishTask&&!isWaitTask" :x="0" :y="-16" :width="16" :height="16" :xlink:href="icon['yes']"></image>
    <image v-if="readonly&&!isCanceledWorkflow&&isWaitTask" :x="-3" :y="-16" :width="42" :height="13" :xlink:href="icon['processing']"></image>
    <image v-if="subProcessProcessInstanceId" :x="node.w/2-15" :y="-30" :width="30" :height="30" :xlink:href="icon['subProcess']"></image>

    <rect
      class="node"
      :class="{'selected': node.selected}"
      :width="node.w"
      :height="node.h"
    ></rect>

    <image
      x="0"
      y="0"
      :width="node.w"
      :height="node.h"
      :xlink:href="icon[node.icon]"
    ></image>

    <mytext v-if="node.compType==='task'" :x="6" :y="8" :w="node.w-12" :h="node.h-12" :desc="node.label"></mytext>

    <mytext v-if="taskAssignee" :x="0" :y="node.h" :w="node.w" verticalAlign="top" textAlign="center" :desc="taskAssignee"></mytext>
    
    <g v-if="!readonly">
      <polygon v-if="!dotLink||node.selected" :points="wrapDotPoints" style="fill:transparent;"></polygon>
      <polygon class="triangle" :points="topPolygonPoints" @mouseup="endLinkedNode('top', node)"/>
      <polygon class="triangle" :points="rightPolygonPoints" @mouseup="endLinkedNode('right', node)"/>
      <polygon class="triangle" :points="bottomPolygonPoints" @mouseup="endLinkedNode('bottom', node)"/>
      <polygon class="triangle" :points="leftPolygonPoints" @mouseup="endLinkedNode('left', node)"/>
      <image class="dot" v-if="!dotLink||node.selected" :x="(node.w/2-13)" :y="(-28)" :xlink:href="icon.top" @mousedown="startLinkNode($event, 'top')"></image>
      <image class="dot" v-if="!dotLink||node.selected" :x="(node.w+14)" :y="(node.h/2-13)" :xlink:href="icon.right" @mousedown="startLinkNode($event, 'right')"></image>
      <image class="dot" v-if="!dotLink||node.selected" :x="(node.w/2-13)" :y="(node.h+14)" :xlink:href="icon.bottom" @mousedown="startLinkNode($event, 'bottom')"></image>
      <image class="dot" v-if="!dotLink||node.selected" :x="(-28)" :y="(node.h/2-13)" :xlink:href="icon.left" @mousedown="startLinkNode($event, 'left')"></image>
    </g>

  </g>
</template>

<script>
import mytext from './svgtext.vue'
import { icon } from "./icon/index.js";
import eventBus, {EVENTS} from "../common/eventBus"
import { getUrlParams } from "@/utils/tools";
import service from "@/common/service";
export default {
  components: { mytext },
  props: ['node', 'dotLink', 'readonly', 'progress'],
  data() {
    return {
      icon,
      isCanceledWorkflow: false,
      isFinishTask: false,
      isWaitTask: false,
      taskAssignee: '',
      params: {},
      subProcessProcessInstanceId: ''
    }
  },
  computed: {
    topPolygonPoints() {
      if (this.node) {
        return `0,0 ${this.node.w},0 ${this.node.w / 2},${this.node.h / 2}`
      } else {
        return ''
      }
    },
    rightPolygonPoints() {
      if (this.node) {
        return `${this.node.w},0 ${this.node.w},${this.node.h} ${this.node.w / 2},${this.node.h / 2}`
      } else {
        return ''
      }
    },
    bottomPolygonPoints() {
      if (this.node) {
        return `${this.node.w},${this.node.h} 0,${this.node.h} ${this.node.w / 2},${this.node.h / 2}`
      } else {
        return ''
      }
    },
    leftPolygonPoints() {
      if (this.node) {
        return `0,0 0,${this.node.h} ${this.node.w / 2},${this.node.h / 2}`
      } else {
        return ''
      }
    },
    wrapDotPoints() {
      if (this.node) {
        return `-30,-30 ${this.node.w + 30},-30 ${this.node.w + 30},${this.node.h + 30} -30,${this.node.h + 30}`
      } else {
        return ''
      }
    }
  },
  watch: {
    progress: {
      immediate: true,
      handler() {
        if (this.progress && this.node) {
          if (this.progress.finishTasks && this.node.id && this.progress.finishTasks.includes(this.node.id)) {
            this.isFinishTask = true
          }
          if (this.progress.waitTasks && this.node.id && this.progress.waitTasks.includes(this.node.id)) {
            this.isWaitTask = true
          }
          if (this.progress.taskAssigneeMap) {
            try {
              let taskAssignee = JSON.parse(this.progress.taskAssigneeMap)[this.node.id]
              taskAssignee = taskAssignee ? taskAssignee.split(',').map(item => { return { account: item } }) : [];
              service.batchUsers(taskAssignee).then(res => {
                this.taskAssignee = res.data.map(item => item.userName).join(',')
              })
            } catch (e) {
              console.log(e)
            }
          }
        }
      }
    }
  },
  created() {
    this.params = getUrlParams();
    if (this.params.mode === "preview" && this.params.status === "delete") {
      this.isCanceledWorkflow = true
    }
    if (this.params.mode === "preview" && this.params.instanceId && this.node.workflow.subProcess) {
      service.subInfo({ processInstanceId: this.params.instanceId }).then(res => {
        this.subProcessProcessInstanceId = res.data
      })
    }
  },
  methods: {
    /**
     * 去子流程跟踪页面
     */
    goSubProcess() {
      if (this.subProcessProcessInstanceId) {
        window.open(`/workflow-designer/index.html?mode=preview&instanceId=${this.subProcessProcessInstanceId}`, '_blank');
      }
    },
    /**
     * 画布中间操作区节点鼠标按下事件
     * @argument {NodeClass} node - 节点
     */
    nodemousedown($event, node) {
      if (this.readonly) {
        return
      }
      eventBus.$emit(EVENTS.GRAPH_NODE_MOUSEDOWN, node)
    },

    /**
     * 开始连接节点
     * @description 连线起始函数
     * @argument {string} position - 连线起点位置
     */
    startLinkNode($event, position) {
      this.$emit('startLinkNode', position)
    },

    /**
     * 节点完成连接
     * @description 连线终止函数
     * @argument {string} position - 连线终点位置
     * @argument {NodeClass} node - 终止节点
     */
    endLinkedNode(position, node) {
      // 因为 连接点为水平方向与纵向时目前为直线，先写死完成节点，后期优化
      if ((this.dotLink === 'top' || this.dotLink === 'bottom') && (position === 'left' || position === 'right')) {
        position = this.dotLink === 'top' ? 'bottom' : 'top'
      } else if ((this.dotLink === 'left' || this.dotLink === 'right') && (position === 'top' || position === 'bottom')) {
        position = this.dotLink === 'left' ? 'right' : 'left'
      }

      this.$emit('endLinkedNode', position, node)
    }
  }
}
</script>

<style lang="scss" scoped>
g.node-container {
  user-select: none;
  cursor: move;
  .node {
    fill: transparent;
    stroke-width: 1px;
    stroke: transparent;
    cursor: drop;
    transition: all 0.2s ease-in-out;
    stroke-dasharray: 2;
    shape-rendering: crispEdges;
  }
  &:hover .node {
    stroke: #ff0000;
  }
  &.selected {
    .node {
      stroke: #88f;
    }
    .dot {
      opacity: 0.15;
    }
  }
  &.readonly {
    cursor: no-drop;
    .node {
      stroke: transparent;
    }
  }
  &.disabled {
    cursor: no-drop;
    opacity: 0.5;
    .node {
      stroke: transparent;
    }
  }
  .dot {
    opacity: 0;
    &:hover {
      opacity: 1!important;
      cursor: crosshair!important;
    }
  }
  &:hover .dot {
    opacity: 0.15;
  }
  .triangle {
    fill: transparent;
  }
}
</style>
