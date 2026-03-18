import UserList from 'src/views/users/UserList'

const UsersPage = () => {
  return <UserList />
}

UsersPage.authGuard = true

export default UsersPage