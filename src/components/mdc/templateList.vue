<template>
  <div class="subflow">
    <el-dialog
      v-if="dialogVisible"
      title="选择子流程"
      :visible.sync="dialogVisible"
      width="900px"
      :before-close="handleClose"
      >
      <div>
        <div class="public-searchForm">
          <el-form inline :model="searchForm">
            <el-form-item label="模板名称">
              <el-input v-model="searchForm.templateName" clearable placeholder="请输入模板名称"></el-input>
            </el-form-item>
            <el-form-item label="模板对象">
              <el-select v-model="searchForm.formType" placeholder="请选择模板对象">
                <el-option
                  v-for="(item, index) in this.formTypeOption"
                  :key="index"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="default" @click="reset">重置</el-button>
              <el-button type="primary" @click="query">查询</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="public-table">
          <el-table :data="tableData" border height="300" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="templateCode" label="流程编码" />
            <el-table-column prop="formTypeText" label="模板对象" />
            <el-table-column prop="templateName" label="模板名称" />
            <el-table-column prop="statusText" label="状态" />
          </el-table>
        </div>
        <div class="public-pagination">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="page.pageNum"
            :page-sizes="page.sizeArray"
            :page-size="page.pageSize"
            :total="page.total"
            :layout="page.layout"
          >
          </el-pagination>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="selectHandle">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import service from "@/common/service";
export default {
  props: ['value', 'nodeData'],
  data() {
    return {
      dialogVisible: true,
      multipleSelection: [],
      realSearchOption: {},
      page: {
        pageNum: 1,
        pageSize: 10,
        sizeArray: [5, 10, 20, 50, 100],
        total: 0,
        layout: 'sizes, total, jumper, prev, pager, next'
      },
      searchForm: {
        templateName: '',
        formType: ''
      },
      tableData: [],
      // 表单对象
      formTypeOption: [{
        value: 'store',
        label: '店铺档案'
      }, {
        value: 'goods',
        label: '物料档案'
      }, {
        value: 'customer',
        label: '客户档案'
      }, {
        value: 'supplier',
        label: '供应商档案'
      }, {
        value: 'bom',
        label: 'BOM档案'
      }, {
        value: 'process_route',
        label: '工艺路线档案'
      }, {
        value: 'work_center',
        label: '工作中心档案'
      }],
      // 状态
      statusOption: [{
        value: 0,
        label: '已禁用'
      }, {
        value: 1,
        label: '已启用'
      }],
    }
  },
  created() {
    this.query()
  },
  methods: {
    // 获取表单对象
    getFormTypeText(formType) {
      let text = formType;
      this.formTypeOption.forEach(item => {
        if (item.value === formType) {
          text = item.label
        }
      });
      return text;
    },
    // 获取状态文案
    getStatusText(status) {
      let text = status;
      this.statusOption.forEach(item => {
        if (item.value === status) {
          text = item.label
        }
      });
      return text;
    },
    // 多选事件
    handleSelectionChange(list) {
      this.multipleSelection = list
    },
    handleClose() {
      this.$emit('selectSubflow', [])
    },
    // 确认事件
    selectHandle() {
      if (!this.multipleSelection || this.multipleSelection.length === 0) {
        return this.$message.error('请选择')
      }
      // this.current = this.tableData.filter(item => item.key === this.radio)
      // this.calbackData(this.radio)
      this.dialogVisible = false;
      // this.showMapping = true;
      this.$emit('selectSubflow', this.multipleSelection)
    },
    // 重置
    reset() {
      this.searchForm.templateName = ''
      this.searchForm.formType = ''
      this.query()
    },
    // 查询按钮事件
    query() {
      this.realSearchOption = {
        pageNum: 1,
        pageSize: this.page.pageSize,
        templateName: this.searchForm.templateName,
        formType: this.searchForm.formType
      }
      this.getList()
    },
    // 获取列表数据
    getList() {
      service.getMdcFlowTemplateList(this.realSearchOption).then(({ data }) => {
        this.tableData = data.list ? data.list.map(item => {
          return {
            ...item,
            formTypeText: this.getFormTypeText(item.formType),
            statusText: this.getStatusText(item.status)
          }
        }) : []
        this.page.pageNum = data.pageNum
        this.page.pageSize = data.pageSize
        this.page.total = data.total
      })
    },
    // 切换分页事件
    handleSizeChange(pageSize) {
      this.realSearchOption.pageSize = pageSize
      this.getList()
    },
    // 切换当前页事件
    handleCurrentChange(pageNum) {
      this.realSearchOption.pageNum = pageNum
      this.getList()
    },
  }
}
</script>
