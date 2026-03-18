import { useEffect, useState } from 'react'
import { getUserStats } from 'src/services/userService'

const UserStats = ({ users = [] }) => {
  const total = users.length
  const active = users.filter(u => u.status === 'ACTIVE').length
  const field = users.filter(u => u.role === 'DELIVERY_AGENT').length

  return (
    <div className='flex gap-4'>
      <div>Total: {total}</div>
      <div>Active: {active}</div>
      <div>Field: {field}</div>
    </div>
  )
}

export default UserStats