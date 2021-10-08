import service from './service'
const comps = [
    {
        group: "核心",
        children: [
            {
                type: 'startEvent',
                label: '开始',
                icon: 'start',
                w: 32,
                h: 32
            },
            {
                type: 'endEvent',
                label: '结束',
                icon: 'end',
                w: 32,
                h: 32
            },
            {
                type: 'task',
                label: '起草',
                icon: 'task1',
                w: 70,
                h: 70,
                workflow: {
                    showExternalFlowMaping: false,
                    showSubflow: false,
                    showApproval: false,
                    approval: null,
                    unRevoke: true,
                    canInvalid: true,
                    canPushes: true,
                    canDelegate: true,
                    canEmail: true,
                    canMessage: true,
                    isStartTask: true,
                    icon: 'task1'
                }
            },
            {
                type: 'gateway',
                label: '网关',
                icon: 'gateway',
                w: 64,
                h: 64
            },
            {
                type: 'task',
                label: '任务',
                icon: 'task',
                w: 110,
                h: 70,
                workflow: {
                    showExternalFlowMaping: true,
                    showSubflow: true,
                    showApproval: true,
                    approval: null,
                    unRevoke: true,
                    canInvalid: true,
                    canPushes: true,
                    canDelegate: true,
                    canEmail: true,
                    canMessage: true,
                    subProcess: '',
                    subFieldMaping: '',
                    externalFlowMaping: '',
                    icon: 'task'
                }
            }
        ]
    }
]

const properties = {
    workflow: [
        { label: "基本信息", type: "divider" },
        { label: '流程ID', mapping: 'id', type: 'input', value: "", disabled: true },
        { label: '流程名称', mapping: 'name', type: 'input', value: "" },
        { label: '流程作者', mapping: 'author', type: 'input', value: "" },
        { label: '版本', mapping: 'version', type: 'input', value: "1.0" },
        { label: '备注', mapping: 'description', type: 'textarea', value: '', showWordLimit: true, maxlength: 200, rows: 3 }
    ],

    startEvent: [
        { label: "基本信息", type: "divider" },
        { label: 'ID', mapping: 'id', type: 'input', value: "", disabled: true },
        { label: '名称', mapping: 'label', type: 'input', value: "" },
        { label: '备注', mapping: 'workflow.description', type: 'textarea', value: '', showWordLimit: true, maxlength: 200, rows: 3 }
    ],

    task: [
        { label: "基本信息", type: "divider" },
        { label: 'ID', mapping: 'id', type: 'input', value: "", disabled: true },
        { label: '名称', mapping: 'label', type: 'input', value: "" },
        { label: '备注', mapping: 'workflow.description', type: 'textarea', value: '', showWordLimit: true, maxlength: 200, rows: 3 },
        { label: "相关配置", type: "divider" },
        { label: "不可取回", mapping: "workflow.unRevoke", type: "switch", value: false },
        { label: "可作废", mapping: "workflow.canInvalid", type: "switch", value: false },
        { label: "可催办", mapping: "workflow.canPushes", type: "switch", value: false },
        { label: "可委托", mapping: "workflow.canDelegate", type: "switch", value: false },
        { label: "邮件通知", mapping: "workflow.canEmail", type: "switch", value: false },
        { label: "短信通知", mapping: "workflow.canMessage", type: "switch", value: false },
        { label: "子流程配置", type: "divider", vif: "workflow.showSubflow" },
        { label: "子流程", mapping: "workflow.subProcess", type: "selectSubflow", value: "", vif: "workflow.showSubflow"},
        { label: "外部子流程", mapping: "workflow.externalFlowMaping", type: "externalFlowMaping", value: "", vif: "workflow.showExternalFlowMaping"},
        { label: "外部系统调用", type: "divider", vif: "workflow.showExternalFlowMaping" },
        {
            vif: "workflow.showExternalFlowMaping",
            addLabel: "添加参数", mapping: "workflow.externaParams", type: "$List", supportAddRow: true, supportDelRow: true, value: [], columns: [
                { field: 'field', type: "input", value: "", placeholder: "参数名" },
                { field: 'value', type: "input", value: "", placeholder: "参数值" }
            ],
            addHandler() {
                return { field: "", value: "" }
            }
        },
        // {
        //     label: "触发事件", mapping: "workflow.emailEvent", type: "select", value: "", options: [
        //         { value: "create", label: "任务创建" },
        //         { value: "assignment", label: "任务分配" },
        //         { value: "complete", label: "任务完成" },
        //     ],
        //     vif: "workflow.canEmail"
        // },
        { label: "处理人配置", type: "divider", vif: 'workflow.showApproval' },
        {
            addLabel: "添加", mapping: "workflow.approval", type: "$List", supportAddRow: false, supportDelRow: false, vif: 'workflow.showApproval',
            value: [{ type: "user", value: "" }],
            columns: [
                {
                    field: 'type', type: "select", value: "user",style: 'width:90px',
                    options: [{ value: "user", label: "用户" }, { value: "group", label: "用户组" }, { value: "assginee", label: "处理人" }],
                    onChange(val, data, field) {
                        data.value = '';
                    }
                },
                {
                    field: 'value', type: "input", value: "", multiple: true, placeholder: "", options: [], dynamic(data) {
                        return { field: 'value', type: data.type === "user" ? "selectUser" : "select", value: "", options: data.type || [], multiple: data.type !== "assginee", multipleLimit: data.type === "user" ? 0 : 1}
                    }
                }
            ],
            addHandler() {
                return { type: "", value: "" }
            }
        },

        { label: "参数", type: "divider" },
        {
            addLabel: "添加参数", mapping: "workflow.userAttributes", type: "$List", supportAddRow: true, supportDelRow: true, value: [], columns: [
                { field: 'field', type: "input", value: "", placeholder: "参数名" },
                { field: 'value', type: "input", value: "", placeholder: "参数值" }
            ],
            addHandler() {
                return { field: "", value: "" }
            }
        }
    ],
    gateway: [
        { label: "基本信息", type: "divider" },
        { label: 'ID', mapping: 'id', type: 'input', value: "", disabled: true },
        { label: '名称', mapping: 'label', type: 'input', value: "" },
        { label: '备注', mapping: 'workflow.description', type: 'textarea', value: '', showWordLimit: true, maxlength: 200, rows: 3 },
        { label: "相关配置", type: "divider" },
        { label: "并行", mapping: "workflow.isParallel", type: "switch", value: false },
    ],
    sequenceFlow: [
        { label: 'ID', mapping: 'id', type: 'input', value: "", disabled: true },
        { label: '名称', mapping: 'label', type: 'input', value: "" },
        { label: '备注', mapping: 'workflow.description', type: 'textarea', value: '', showWordLimit: true, maxlength: 200, rows: 3 },
        { label: "相关配置", type: "divider" },
        { label: "条件", mapping: "workflow.hasCondition", type: "switch", value: false },
        { label: "条件表达式", mapping: "workflow.condition", type: "input", value: '', vif: 'workflow.hasCondition' }
    ],
    endEvent: [
        { label: "基本信息", type: "divider" },
        { label: 'ID', mapping: 'id', type: 'input', value: "", disabled: true },
        { label: '名称', mapping: 'label', type: 'input', value: "" },
        { label: '备注', mapping: 'workflow.description', type: 'textarea', value: '', showWordLimit: true, maxlength: 200, rows: 3 }
    ],
}


export {
    comps,
    properties
}