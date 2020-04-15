module.exports = {
    db:{
        submits:[
            {
                id:'allDbSearch',
                name:"全库搜索",
                config:{clumn:'tel'}
            }
        ]
    },
    document: {
        transforms: {
            move: [
                {
                    label: "共享号池去重",
                    description: "共享号池去重",
                    name: "plugins/unrepeat",
                    config: { columns: ["tel"], db: "public", cl: "quchong", insert: true },
                    default: "Y"
                },
                {
                    label: "工作号号码退订并同步至平台",
                    description: "工作号号码退订并同步至平台",
                    name: "plugins/gzhTuiDing",
                    config: {},
                    default: "N"
                }
            ],
            removeMany: [
                {
                    label: "云录音号码退订并同步至平台",
                    description: "号码退订并同步至平台",
                    name: "plugins/ylyTuiDing",
                    config: {},
                    default: "N"
                }
            ]
        },
        submits: [
            {
                id: "moveByRule",
                name: "根据规则迁移数据"
            },
            {
                id: "syncMobilePool",
                name: "同步号码至能力平台",
                batch: ["all", "filter", "ids"]
            }
        ]
    },
    httpApiUrl: {
        syncMobilePool: {
            syncTle: process.env.TMS_MONGODB_WEB_SYNCTEL_URL
        }
    }
}
