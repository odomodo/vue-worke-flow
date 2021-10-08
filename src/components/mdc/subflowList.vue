<template>
  <div>
    <el-button type="primary" @click="showSubFlowList">子流程菜单</el-button>
    <el-dialog
      v-if="dialogVisible"
      title="子流程菜单"
      :visible.sync="dialogVisible"
      width="900px"
    >
      <div>
        <el-button type="primary" @click="showTemplateList = true"
          >新建</el-button
        >
        <el-button type="danger" @click="deleteTemplateList">删除</el-button>
        <div class="public-table">
          <el-table
            :data="tableData"
            border
            height="300"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column type="index" label="序号" width="50" />
            <el-table-column prop="templateCode" label="流程编码" />
            <el-table-column prop="formTypeText" label="模板对象" width="130" />
            <el-table-column prop="templateName" label="模板名称" />
            <el-table-column prop="statusText" label="状态" width="80" />
            <el-table-column label="配置流程字段关系" width="130">
              <template slot-scope="scope">
                <el-button
                  :class="{ noMapping: !scope.row.subFieldMaping }"
                  size="medium"
                  type="text"
                  icon="el-icon-s-tools"
                  @click="setMapping(scope.row)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
    <template-list v-if="showTemplateList" @selectSubflow="selectSubflow" />
    <flowMaping
      v-if="showMapping"
      :currentMapping="currentMapping"
      @changeMapping="changeMapping"
    />
  </div>
</template>

<script>
import templateList from "./templateList.vue";
import flowMaping from "./flowMaping.vue";
import service from "@/common/service";
export default {
  components: { templateList, flowMaping },
  props: ["nodeData"],
  data() {
    return {
      dialogVisible: false,
      showTemplateList: false,
      showMapping: false,
      currentMapping: {},
      multipleSelection: [],
      tableData: [],
      // 表单对象
      formTypeOption: [
        {
          value: "store",
          label: "店铺档案",
        },
        {
          value: "goods",
          label: "物料档案",
        },
        {
          value: "customer",
          label: "客户档案",
        },
        {
          value: "supplier",
          label: "供应商档案",
        },
        {
          value: "bom",
          label: "BOM档案",
        },
        {
          value: "process_route",
          label: "工艺路线档案",
        },
        {
          value: "work_center",
          label: "工作中心档案",
        },
      ],
    };
  },
  methods: {
    // 显示数据
    async showSubFlowList() {
      this.tableData = [];
      // 新数据
      if (
        this.nodeData.workflow.subProcess &&
        this.nodeData.workflow.subProcess.includes("[") &&
        this.nodeData.workflow.subProcess.includes("]")
      ) {
        const list = JSON.parse(this.nodeData.workflow.subProcess);
        this.tableData = list.map((item) => {
          return {
            processKey: item.subProcess,
            subFieldMaping:
              item.subFieldMaping && JSON.stringify(item.subFieldMaping) != "{}"
                ? item.subFieldMaping
                : null,
          };
        });
      }
      // 旧数据
      else if (this.nodeData.workflow.subProcess) {
        this.tableData = [
          {
            processKey: this.nodeData.workflow.subProcess,
            subFieldMaping:
              this.nodeData.workflow.subFieldMaping &&
              JSON.stringify(this.nodeData.workflow.subFieldMaping) != "{}"
                ? JSON.parse(this.nodeData.workflow.subFieldMaping)
                : null,
          },
        ];
      }
      this.dialogVisible = true;
      if (this.tableData.length > 0) {
        for (let i = 0; i < this.tableData.length; i++) {
          let res = await this.getTemplateDetails(this.tableData[i].processKey);
          if (res.code === 200) {
            this.$set(this.tableData, i, { ...this.tableData[i], ...res.data });
          }
        }
        this.tableData = this.tableData.map((item) => {
          return {
            ...item,
            formTypeText: this.getFormTypeText(item.formType),
          };
        });
      }
    },
    // 获取流程详情
    getTemplateDetails(processKey) {
      return service.getTemplateByProcessKey({ processKey });
    },
    // 获取表单对象
    getFormTypeText(formType) {
      let text = formType;
      this.formTypeOption.forEach((item) => {
        if (item.value === formType) {
          text = item.label;
        }
      });
      return text;
    },
    // 新建回调
    selectSubflow(list) {
      this.showTemplateList = false;
      if (list && list.length > 0) {
        const processKeyList = this.tableData.map((row) => row.processKey);
        this.tableData = [
          ...this.tableData,
          ...list
            .filter((item) => !processKeyList.includes(item.processKey))
            .map((row) => {
              return {
                ...row,
                subFieldMaping: null,
              };
            }),
        ];
      }
    },
    // 删除子流程
    deleteTemplateList() {
      if (!this.multipleSelection || this.multipleSelection.length === 0) {
        this.$message.error("请选择");
      } else {
        this.tableData = this.tableData.filter(
          (row) => !this.multipleSelection.includes(row)
        );
      }
    },
    // 多选事件
    handleSelectionChange(list) {
      this.multipleSelection = list;
    },
    // 配置字段
    setMapping(row) {
      this.currentMapping = row;
      this.showMapping = true;
    },
    // 配置字段回调
    changeMapping(obj) {
      this.showMapping = false;
      if (obj.processKey) {
        this.tableData.filter(
          (row) => row.processKey === obj.processKey
        )[0].subFieldMaping = obj.subFieldMaping;
      }
    },
    ok() {
      if (this.tableData.length > 0) {
        this.$set(
          this.nodeData.workflow,
          "subProcess",
          JSON.stringify(
            this.tableData.map((row) => {
              return {
                subProcess: row.processKey,
                subFieldMaping: row.subFieldMaping ? row.subFieldMaping : {},
              };
            })
          )
        );
      } else {
        this.$set(this.nodeData.workflow, "subProcess", "[]");
      }
      this.$set(this.nodeData.workflow, "subFieldMaping", "{}");
      this.dialogVisible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.public-table {
  margin-top: 5px;
}
.noMapping {
  color: #c8c9cc !important;
}
</style>
