<template>
  <q-page padding>
    <q-card>
      <q-card-section>
        <div class="text-h6">User Registration</div>
        <q-form @submit.prevent="registerUser" class="q-gutter-md">
          <q-input v-model="form.firstname" label="First Name" />
          <q-input v-model="form.lastname" label="Last Name" />
          <q-input v-model="form.email" label="Email" type="email" />
          <q-input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-input v-model="form.mobileNo" label="Mobile Number" />
          <q-toggle v-model="form.isAdmin" label="Admin User" />
          <q-btn label="Register" type="submit" color="primary" />
        </q-form>
      </q-card-section>
    </q-card>

    <q-separator class="q-my-md" />

    <q-card>
      <q-card-section>
        <div class="text-h6">All Users</div>
        <q-table :rows="users" :columns="columns" row-key="_id" flat bordered>
          <template v-slot:body-cell-actions="props">
            <q-td align="center">
              <q-btn flat dense color="primary" icon="edit" @click="editUser(props.row)" />
              <q-btn flat dense color="negative" icon="delete" @click="deleteUser(props.row._id)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Edit Dialog -->
    <q-dialog v-model="editDialog" persistent>
      <q-card style="min-width: 300px">
        <q-card-section style="width: 400px; height: 450px">
          <div class="text-h6">Edit User</div>
          <q-form @submit.prevent="updateUser">
            <q-input v-model="editForm.firstname" label="First Name" />
            <q-input v-model="editForm.lastname" label="Last Name" />
            <q-input v-model="editForm.email" label="Email" />
            <q-input
              v-model="editForm.password"
              :type="showEditPassword ? 'text' : 'password'"
              label="New Password"
            >
              <template v-slot:append>
                <q-icon
                  :name="showEditPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showEditPassword = !showEditPassword"
                />
              </template>
            </q-input>

            <q-input v-model="editForm.mobileNo" label="Mobile Number" />
            <q-toggle v-model="editForm.isAdmin" label="Admin User" />

            <!-- Button row -->
            <div class="row q-gutter-sm q-mt-md">
              <q-btn flat label="Save" type="submit" color="primary" class="col" />
              <q-btn
                label="Cancel"
                flat
                color="secondary"
                class="col"
                @click="editDialog = false"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import api from '../utils/api'
import { notifySuccess, notifyError } from '../utils/notify'

export default {
  name: 'UserManagement',
  data() {
    return {
      showPassword: false,
      showEditPassword: false,
      form: {
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        mobileNo: '',
        isAdmin: false,
      },
      editForm: {
        _id: '',
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        mobileNo: '',
        isAdmin: false,
      },
      editDialog: false,
      users: [],
      columns: [
        { name: 'firstname', label: 'First Name', field: 'firstname' },
        { name: 'lastname', label: 'Last Name', field: 'lastname' },
        { name: 'email', label: 'Email', field: 'email' },
        { name: 'mobileNo', label: 'Mobile', field: 'mobileNo' },
        {
          name: 'isAdmin',
          label: 'Admin',
          field: 'isAdmin',
          format: (val) => (val ? 'Yes' : 'No'),
        },
        { name: 'actions', label: 'Actions', field: 'actions', sortable: false },
      ],
    }
  },
  methods: {
    async getUsers() {
      try {
        const res = await api.get('/api/users')
        this.users = res.data
      } catch (error) {
        console.error('Error fetching users:', error)
        notifyError({ type: 'negative', message: 'Failed to fetch users' })
      }
    },
    async registerUser() {
      try {
        await api.post('/api/register', this.form)
        notifySuccess('User registered successfully'), this.resetForm()
        this.getUsers()
      } catch (err) {
        notifyError({
          message: err.response?.data?.message || 'Error during registration',
        })
      }
    },
    async deleteUser(id) {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await api.delete(`/api/delete/${id}`)
          notifySuccess('User deleted successfully')
          this.getUsers()
        } catch (error) {
          console.error('Error deleting user:', error)

          const errorMessage =
            error.response && error.response.data && error.response.data.message
              ? error.response.data.message
              : 'Error deleting user'

          notifyError(errorMessage)
        }
      }
    },

    editUser(user) {
      this.editForm = { ...user, password: '' }
      this.editDialog = true
    },
    async updateUser() {
      try {
        await api.put(`/api/update/${this.editForm._id}`, this.editForm)
        notifySuccess('User updated successfully')
        this.editDialog = false
        this.getUsers()
      } catch (error) {
        console.error('Error updating user:', error)
        notifyError('Failed to update user')
      }
    },
    resetForm() {
      this.form = {
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        mobileNo: '',
        isAdmin: false,
      }
    },
  },
  mounted() {
    this.getUsers()
  },
}
</script>
