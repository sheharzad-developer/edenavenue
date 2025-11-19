'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'
import Select from '@/components/ui/Select'

interface RequestFormProps {
  onCancel?: () => void
}

export default function RequestForm({ onCancel }: RequestFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [priority, setPriority] = useState('MEDIUM')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, houseNumber, priority }),
    })

    if (!res.ok) {
      const error = await res.json()
      console.error('Request creation error:', error)
      alert(error.error || 'Failed to submit request')
      return
    }

    setTitle('')
    setDescription('')
    setHouseNumber('')
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
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="houseNumber">House/Unit Number</Label>
        <Input
          id="houseNumber"
          value={houseNumber}
          onChange={e => setHouseNumber(e.target.value)}
          placeholder="e.g., 101, Unit A, etc."
        />
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select id="priority" value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </Select>
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
