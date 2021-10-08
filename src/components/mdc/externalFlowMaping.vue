<template>
  <div class="externalFlowMaping">
    <div class="wrap-select">
      <div class="dialog-select" @click="showMapping()">
        <div class="list">{{ nodeData.workflow.externalFlowMaping }}</div>
        <div class="select-btn-group">
          <i v-if="!nodeData.workflow.externalFlowMaping" class="el-icon-arrow-down"></i>
          <i v-else class="el-icon-circle-close" @click.stop="nodeData.workflow.externalFlowMaping=''"></i>
        </div>
      </div>
      <div class="edit" @click="showMapping()" v-if="nodeData.workflow.externalFlowMaping">
        <i class="el-icon-edit"></i>
      </div>
    </div>
    <el-dialog
      title="流程字段对应关系"
      :visible.sync="dialogVisible"
      :before-close="close"
      width="900px"
    >
      <el-table :data="tableData" border height="300">
        <el-table-column type="index" width="50"> </el-table-column>
        <el-table-column label="外部子流程字段">
          <template slot-scope="scope">
            <el-input filterable clearable v-model="scope.row.key" placeholder="请输入外部子流程字段" @change="keyChange(scope.row)"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="转换" align="center">
          <template>
            <span class="el-icon-right"></span>
          </template>
        </el-table-column>
        <el-table-column label="主流程字段">
          <template slot-scope="scope">
            <el-select
              filterable
              clearable
              v-model="scope.row.value"
            >
              <el-option
                v-for="(item, index) in valueList"
                :label="item.label"
                :value="item.fieldName"
                :key="index"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column width="80">
          <template slot="header">
            <el-button
              size="medium"
              type="text"
              icon="el-icon-circle-plus-outline"
              @click="addRow('last')"
            ></el-button>
          </template>
          <template slot-scope="scope">
            <el-button
              size="medium"
              type="text"
              style="color: red"
              icon="el-icon-remove-outline"
              @click="delRow(scope.row)"
            ></el-button>
            <el-button
              size="medium"
              type="text"
              icon="el-icon-circle-plus-outline"
              @click="addRow(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancle">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import service from "@/common/service";
import { getUrlParams } from "@/utils/tools";
export default {
  props: ["nodeData"],
  data() {
    return {
      dialogVisible: false,
      tableData: [],
      keyList: [],
      valueList: [],
    };
  },
  methods: {
    showMapping() {
      this.dialogVisible = true;
      let arr = [];
      let jsonData = {};
      if (this.nodeData.workflow.externalFlowMaping) {
        jsonData = JSON.parse(this.nodeData.workflow.externalFlowMaping);
        for (let i in jsonData) {
          arr.push({ key: i, value: jsonData[i] });
        }
      }
      this.tableData = arr;
      if (!getUrlParams().modelKey) {
        setTimeout(() => {
          this.$message.error("请先配置好主流程字段设置");
        }, 100);
        return false;
      }
      this.getTemplateDetails(getUrlParams().modelKey).then((res) => {
        const { data } = res;
        this.getFieldList(
          data.formType,
          data.processKey,
          data.taskDetail
            .filter((item) => item.taskType === "START")
            .map((item) => item.taskKey)
            .join(",")
        ).then((res) => {
          if (res.data && res.data.length > 0) {
            this.valueList = res.data.map(item => {
              return {
                ...item,
                label: `${item.fieldName}${item.fieldRemark ? ('（'+item.fieldRemark+'）') : ''}`
              }
            });
          } else {
            this.$message.error("请先配置好主流程字段设置");
          }
        });
      });
    },
    getTemplateDetails(processKey) {
      return service.getTemplateByProcessKey({ processKey });
    },
    getFieldList(formType, processKey, taskKey) {
      return service.getSubFieldMapping({ formType, processKey, taskKey });
    },
    delRow(row) {
      this.tableData.splice(this.tableData.indexOf(row), 1);
    },
    addRow(row) {
      if (row === "last") {
        this.tableData.push({ key: "", value: "" });
      } else {
        this.tableData.splice(this.tableData.indexOf(row) + 1, 0, {
          key: "",
          value: "",
        });
      }
    },
    keyChange(row) {
      const arr = this.valueList.filter(item => item.fieldName === row.key)
      if (arr.length === 1) {
        row.value = row.key
      }
    },
    cancle() {
      this.close();
    },
    ok() {
      if (this.tableData.some(item => !item.key)) {
        this.$message.error('表格中有子流程字段没有填写');
        return false;
      }
      let data = {};
      this.tableData
        .filter((item) => !!item.key && !!item.value)
        .forEach((item) => {
          data[item.key] = item.value;
        });
      this.$set(this.nodeData.workflow, "externalFlowMaping", JSON.stringify(data));
      this.close();
    },
    close() {
      this.dialogVisible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.dialog-select {
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  min-height: 28px;
  width: 193px;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  .list {
    box-sizing: border-box;
    padding: 0 15px;
    overflow: hidden;
  }
  .current {
    margin: 2px 0 2px 6px;
  }
  .select-btn-group {
    width: 34px;
    flex-shrink: 0;
    text-align: center;
    color: #c0c4cc;
    i {
      line-height: 28px;
    }
  }
}
.wrap-select {
  display: flex;
  .edit {
    margin-left: 10px;
    color: #00aa91;
    cursor: pointer;
  }
}
</style>
