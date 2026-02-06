export const AiService = {
  //模拟生成代码埋点
  generateCode: (requirement: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          `// AI 为需求 "${requirement}" 生成的代码\ntracker.log('click', { action: 'signup' });`
        )
      }, 1500)
    })
  },
}
