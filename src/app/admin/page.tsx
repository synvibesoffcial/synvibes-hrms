import { redirect } from 'next/navigation'
import { checkRole } from '../../../utils/roles'
import { SearchUsers } from './SearchUsers'
import { clerkClient, createClerkClient } from '@clerk/nextjs/server'
import { removeRole, setRole } from './_actions'
// import { inviteUser } from './_inviteAction'

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>
}) {
  if (!checkRole('admin')) {
    redirect('/')
  }

  const query = (await params.searchParams).search

  // const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY }) //to use createinvitation function

  // const client = clerkClient // await clerkClient() if i had imported clerkClient
  const client = await clerkClient()
  
  const users = query ? (await client.users.getUserList({ query })).data : []

  // Fetch all users for the list at the top
  const allUsers = (await client.users.getUserList()).data



  return (
    <>
      <p>This is the protected admin dashboard restricted to users with the `admin` role.</p>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">All Users</h2>
        <ul className="bg-gray-800 rounded p-4">
          {allUsers.map((user) => (
            <li key={user.id} className="mb-6 border-b border-gray-700 last:border-b-0 pb-4 last:pb-0 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1">
                <span className="font-semibold text-white">{user.firstName} {user.lastName}</span>
                <span className="text-gray-300 ml-2">
                  {user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress}
                </span>
                <span className="ml-4 text-base text-yellow-400 font-mono">{user.publicMetadata.role as string}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                <form action={setRole} className="flex gap-2 items-center mb-1">
                  <input type="hidden" value={user.id} name="id" />
                  <input type="hidden" value="hr" name="role" />
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-semibold shadow">Make hr</button>
                </form>
                <form action={setRole} className="flex gap-2 items-center mb-1">
                  <input type="hidden" value={user.id} name="id" />
                  <input type="hidden" value="employee" name="role" />
                  <button type="submit" className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-4 py-2 rounded font-semibold shadow">Make Employee</button>
                </form>
                <form action={removeRole} className="flex gap-2 items-center">
                  <input type="hidden" value={user.id} name="id" />
                  <button type="submit" className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded font-semibold shadow">Remove Role</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-white">Invite hr or Employee</h2>
        <form action={inviteUser} className="flex flex-col sm:flex-row gap-4 bg-gray-900 p-4 rounded mb-6 border border-gray-700">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            required
            className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="role"
            required
            className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="hr">hr</option>
            <option value="employee">Employee</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold shadow"
          >
            Send Invitation
          </button>
        </form>
      </div> */}


      <SearchUsers />

      {users.map((user) => {
        return (
          <div key={user.id} className="bg-gray-900 shadow-lg rounded p-6 mb-6 flex flex-col gap-3 border border-gray-700">
            <div className="font-bold text-xl text-white">
              {user.firstName} {user.lastName}
            </div>

            <div className="text-gray-300">
              {
                user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
                  ?.emailAddress
              }
            </div>

            <div className="text-base text-yellow-400 font-mono mb-2">{user.publicMetadata.role as string}</div>

            <form action={setRole} className="flex gap-2 items-center mb-1">
              <input type="hidden" value={user.id} name="id" />
              <input type="hidden" value="hr" name="role" />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-semibold shadow">Make hr</button>
            </form>

            <form action={setRole} className="flex gap-2 items-center mb-1">
              <input type="hidden" value={user.id} name="id" />
              <input type="hidden" value="employee" name="role" />
              <button type="submit" className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-4 py-2 rounded font-semibold shadow">Make Employee</button>
            </form>

            <form action={removeRole} className="flex gap-2 items-center">
              <input type="hidden" value={user.id} name="id" />
              <button type="submit" className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded font-semibold shadow">Remove Role</button>
            </form>
          </div>
        )
      })}
    </>
  )
}