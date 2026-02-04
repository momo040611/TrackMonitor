import { Typography } from 'antd'
const isError = (value: unknown): value is Error =>
  typeof value === 'object' && value !== null && 'message' in value
export const ErrorBox = ({ error }: { error: unknown }) => {
  if (isError(error)) {
    return <Typography.Text type={'danger'}>{error.message}</Typography.Text>
  }
  return null
}
