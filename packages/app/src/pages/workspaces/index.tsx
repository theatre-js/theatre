import React, {useState} from 'react'
import {withPageAuthRequired} from 'src/utils/withPageAuthRequired'
import {trpcClient} from 'src/trpc/trpcClient'

const WorkspacesPage: React.FC<{}> = withPageAuthRequired(({}) => {
  const {data} = trpcClient.workspaces.getAll.useQuery()

  if (!Array.isArray(data)) return <>no projects</>

  return (
    <div>
      <ul>
        {data.map((data) => (
          <li key={data.id}>
            <h2>{data.name}</h2>
            <p>{data.description}</p>
          </li>
        ))}
      </ul>
      {/* <AddForm /> */}
    </div>
  )
})

const AddForm: React.FC<{}> = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
  })
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      // If the new project was created successfully, redirect the user to the projects page to see the updated list of projects
      window.location.href = '/projects'
    } else {
      console.error('Failed to create project')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </div>

      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({...formData, description: e.target.value})
          }
        ></textarea>
      </div>

      <button type="submit">Create Project</button>
    </form>
  )
}

interface FormData {
  name: string
  description: string
}

export default WorkspacesPage
