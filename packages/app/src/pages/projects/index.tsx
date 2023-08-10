import {withPageAuthRequired} from '@auth0/nextjs-auth0/client'
import React, {useState} from 'react'
import useApi from '../../useApi'

const ProjectsPage: React.FC<{}> = withPageAuthRequired(({}) => {
  const {response, error, isLoading} = useApi('/api/projects')

  const projects = response

  if (!Array.isArray(projects)) return <>no projects</>

  return (
    <div>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
      <AddForm />
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

export default ProjectsPage
