// src/mock/metadata.ts
export default [
  {
    url: '/api/analysis/metadata',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: {
          dictionary: [
            { field: 'eventName', type: 'string', required: true, description: '事件名称' },
            { field: 'timestamp', type: 'number', required: true, description: '事件时间戳' },
            { field: 'userId', type: 'string', required: false, description: '用户ID' },
            { field: 'deviceId', type: 'string', required: false, description: '设备ID' },
            { field: 'platform', type: 'string', required: false, description: '平台类型' },
            { field: 'browser', type: 'string', required: false, description: '浏览器类型' },
            { field: 'screenWidth', type: 'number', required: false, description: '屏幕宽度' },
            { field: 'screenHeight', type: 'number', required: false, description: '屏幕高度' },
          ],
          tags: [
            { name: '用户行为', category: '行为', color: 'blue' },
            { name: '系统错误', category: '错误', color: 'red' },
            { name: '性能问题', category: '性能', color: 'orange' },
            { name: '业务操作', category: '业务', color: 'green' },
            { name: '页面访问', category: '访问', color: 'purple' },
          ],
          configs: [
            { key: 'maxEventSize', value: '1024', description: '最大事件大小(字节)' },
            { key: 'batchInterval', value: '1000', description: '批量上报间隔(毫秒)' },
            { key: 'sampleRate', value: '1', description: '采样率(0-1)' },
            { key: 'enableCompression', value: 'true', description: '启用压缩' },
          ],
        },
      }
    },
  },
]
