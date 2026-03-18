// import { useEffect, useState } from 'react'
// import { getUsers } from 'src/services/userService'

// // MUI
// import {
//   Box,
//   Card,
//   Typography,
//   Avatar,
//   Chip,
//   Button
// } from '@mui/material'

// // Components
// import UserStats from './UserStats'
// import UserForm from './UserForm'
// import UserDetails from './UserDetails'

// const roles = [
//   'ALL',
//   'SUPER_ADMIN',
//   'ADMIN',
//   'WAREHOUSE_OFFICER',
//   'ORDER_BOOKER',
//   'DELIVERY_AGENT',
//   'ACCOUNTANT',
//   'MANAGER'
// ]

// const UserList = () => {
//   const [users, setUsers] = useState([])
//   const [openForm, setOpenForm] = useState(false)
//   const [selectedUser, setSelectedUser] = useState(null)
//   const [roleFilter, setRoleFilter] = useState('')

//   // 🔥 FETCH USERS
//   const fetchUsers = async () => {
//     try {
//       const res = await getUsers({ role: roleFilter })
//       setUsers(res.data)
//     } catch (err) {
//       console.error(err)
//     }
//   }

//   useEffect(() => {
//     fetchUsers()
//   }, [roleFilter])

//   return (
//     <>
//       {/* 🔥 STATS */}
//       <UserStats users={users} />

//       {/* 🔥 TOP BAR */}
//       <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        
//         {/* ROLE FILTER BUTTONS */}
//         <Box display='flex' gap={2}>
//           {roles.map(role => (
//             <Button
//               key={role}
//               variant={
//                 roleFilter === role || (role === 'ALL' && roleFilter === '')
//                   ? 'contained'
//                   : 'outlined'
//               }
//               onClick={() => setRoleFilter(role === 'ALL' ? '' : role)}
//             >
//               {role === 'ALL' ? 'All' : role.replace('_', ' ')}
//             </Button>
//           ))}
//         </Box>

//         {/* ADD USER */}
//         <Button variant='contained' onClick={() => setOpenForm(true)}>
//           Add User
//         </Button>
//       </Box>

//       {/* 🔥 USERS LIST */}
//       <Card sx={{ p: 4 }}>
//         {users.map(user => (
//           <Box
//             key={user._id}
//             sx={{
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//               p: 3,
//               mb: 3,
//               borderRadius: 2,
//               border: '1px solid #eee',
//               cursor: 'pointer',
//               '&:hover': {
//                 backgroundColor: '#f9f9f9'
//               }
//             }}
//             onClick={() => setSelectedUser(user)}
//           >
//             {/* LEFT SIDE */}
//             <Box display='flex' alignItems='center' gap={3}>
//               <Avatar>
//                 {user.fullName?.first?.[0]}
//                 {user.fullName?.last?.[0]}
//               </Avatar>

//               <Box>
//                 <Typography fontWeight={600}>
//                   {user.fullName?.first} {user.fullName?.last}
//                 </Typography>

//                 <Typography variant='body2' color='text.secondary'>
//                   {user.email}
//                 </Typography>
//               </Box>
//             </Box>

//             {/* RIGHT SIDE */}
//             <Box textAlign='right'>
//               <Chip
//                 label={user.role?.replace('_', ' ')}
//                 color='primary'
//                 sx={{ mb: 1 }}
//               />

//               <Typography
//                 variant='body2'
//                 sx={{
//                   color: user.status === 'ACTIVE' ? 'green' : 'red'
//                 }}
//               >
//                 ● {user.status}
//               </Typography>
//             </Box>
//           </Box>
//         ))}

//         {/* EMPTY STATE */}
//         {users.length === 0 && (
//           <Typography textAlign='center' color='text.secondary'>
//             No users found
//           </Typography>
//         )}
//       </Card>

//       {/* 🔥 ADD USER MODAL */}
//       <UserForm
//         open={openForm}
//         onClose={() => setOpenForm(false)}
//         refresh={fetchUsers}
//       />

//       {/* 🔥 USER DETAILS DRAWER / MODAL */}
//       {selectedUser && (
//         <UserDetails
//           user={selectedUser}
//           onClose={() => setSelectedUser(null)}
//           refresh={fetchUsers}
//         />
//       )}
//     </>
//   )
// }

// export default UserList

import { useEffect, useState } from 'react'
import { getUsers } from 'src/services/userService'

// MUI
import {
  Box,
  Card,
  Typography,
  Avatar,
  Chip,
  Button,
  Grid
} from '@mui/material'

// Components
import UserForm from './UserForm'
import UserDetails from './UserDetails'

const roles = [
  'ALL',
  'SUPER_ADMIN',
  'ADMIN',
  'WAREHOUSE_OFFICER',
  'ORDER_BOOKER',
  'DELIVERY_AGENT',
  'ACCOUNTANT',
  'MANAGER'
]

const UserList = () => {
  const [users, setUsers] = useState([])
  const [openForm, setOpenForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [roleFilter, setRoleFilter] = useState('')

  const fetchUsers = async () => {
    try {
      const res = await getUsers({ role: roleFilter })
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [roleFilter])

  // 🔥 STATS CALCULATION
  const total = users.length
  const active = users.filter(u => u.status === 'ACTIVE').length
  const field = users.filter(u =>
    ['DELIVERY_AGENT', 'ORDER_BOOKER'].includes(u.role)
  ).length

  return (
    <Box>

      {/* 🔥 HEADER */}
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={6}
      >
        <Typography variant='h4' fontWeight={600}>
          User Management
        </Typography>

        <Button
          variant='contained'
          onClick={() => setOpenForm(true)}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 4
          }}
        >
          Add User
        </Button>
      </Box>

      {/* 🔥 STATS */}
      <Grid container spacing={4} mb={6}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 4 }}>
            <Typography variant='body2'>Total Users</Typography>
            <Typography variant='h5' fontWeight={600}>
              {total}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 4 }}>
            <Typography variant='body2'>Active Users</Typography>
            <Typography variant='h5' fontWeight={600}>
              {active}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 4 }}>
            <Typography variant='body2'>Field Users</Typography>
            <Typography variant='h5' fontWeight={600}>
              {field}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* 🔥 ROLE FILTER */}
      <Box display='flex' gap={2} mb={6} flexWrap='wrap'>
        {roles.map(role => (
          <Button
            key={role}
            variant={
              roleFilter === role || (role === 'ALL' && roleFilter === '')
                ? 'contained'
                : 'outlined'
            }
            onClick={() => setRoleFilter(role === 'ALL' ? '' : role)}
            sx={{
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            {role === 'ALL' ? 'All' : role.replace('_', ' ')}
          </Button>
        ))}
      </Box>

      {/* 🔥 USERS LIST */}
      <Card sx={{ p: 4 }}>
        {users.length === 0 ? (
          <Typography textAlign='center' color='text.secondary'>
            No users found
          </Typography>
        ) : (
          users.map(user => (
            <Box
              key={user._id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 3,
                mb: 3,
                borderRadius: 2,
                border: '1px solid #eee',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#f9f9f9'
                }
              }}
              onClick={() => setSelectedUser(user)}
            >
              {/* LEFT */}
              <Box display='flex' alignItems='center' gap={3}>
                <Avatar>
                  {user.fullName?.first?.[0]}
                  {user.fullName?.last?.[0]}
                </Avatar>

                <Box>
                  <Typography fontWeight={600}>
                    {user.fullName?.first} {user.fullName?.last}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              {/* RIGHT */}
              <Box textAlign='right'>
                <Chip
                  label={user.role?.replace('_', ' ')}
                  color='primary'
                  sx={{ mb: 1 }}
                />

                <Typography
                  variant='body2'
                  sx={{
                    color: user.status === 'ACTIVE' ? 'green' : 'red'
                  }}
                >
                  ● {user.status}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </Card>

      {/* 🔥 MODALS */}
      <UserForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={fetchUsers}
      />

      {selectedUser && (
        <UserDetails
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          refresh={fetchUsers}
        />
      )}
    </Box>
  )
}

export default UserList