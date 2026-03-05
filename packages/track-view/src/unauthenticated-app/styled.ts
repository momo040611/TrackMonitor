import styled from '@emotion/styled'

export const StyledInput = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;

  &:focus {
    border-color: #3385ff;
    outline: none;
    box-shadow: 0 0 0 2px rgba(51, 133, 255, 0.2);
  }

  &::placeholder {
    color: #bfbfbf;
  }
`

export const StyledButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #3385ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: #2870e0;
  }

  &:disabled {
    background-color: #bfbfbf;
  }
`
