<template>
  <div class="status-list">
    <div class="item" v-for="(item, index) in list" :key="index">
      <span class="status-icon" :style="{ 'background-image': 'url('+icon[item.iconName]+')' }"></span>
      <span>{{ item.text }}</span>
    </div>
  </div>
</template>

<script>
import { icon } from "@/components/icon/index.js";
export default {
  data() {
    return {
      icon,
      list: [
        {
          iconName: 'canceled',
          text: '流程已取消'
        },
        {
          iconName: 'yes',
          text: '已经过的节点'
        },
        {
          iconName: 'processing',
          text: '当前节点'
        },
        {
          iconName: 'markarrowred',
          text: '已经过的出口'
        },
        {
          iconName: 'markarrow',
          text: '未经过的出口'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.status-list {
  display: flex;
  color: #333;
  font-size: 12px;
  .item {
    display: flex;
    justify-content: center;
    padding-right: 30px;
    span {
      display: inline-block;
      height: 42px;
      line-height: 42px;
    }

    .status-icon {
      width: 42px;
      height: 42px;
      background-repeat: no-repeat;
      background-position: center right;
      margin-right: 10px;
    }
  }
}
</style>
