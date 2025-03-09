import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LandingPage from "@/app/page"



describe('Landing Page', () => {
    beforeAll(() => {
        render(<LandingPage/>)
    })
    it('renders a heading', () => {
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
    })
  })