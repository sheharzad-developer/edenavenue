'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'

interface RequestFormProps {
  onCancel?: () => void
}

export default function RequestForm({ onCancel }: RequestFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, priority }),
    })

    if (!res.ok) {
      const error = await res.json()
      alert(error.error || 'Failed to submit request')
      return
    }

    setTitle('')
    setDescription('')
    setPriority('MEDIUM')

    if (onCancel) {
      onCancel()
      router.refresh()
    } else {
      router.push('/dashboard/requests')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} required />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} required />
      </div>

      <div>
        <Label>Priority</Label>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900 dark:focus-visible:ring-blue-400"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      <div className="flex gap-3">
        <Button type="submit">Submit Request</Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
