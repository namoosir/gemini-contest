import * as React from "react"
import { Button } from "./button"
import Icon from "@mdi/react"
import { mdiArrowLeft, mdiArrowRight, mdiCheck } from "@mdi/js"

interface CardHOCProps {
  WrappedComponent: React.ReactNode,
  handlePreviousPage: () => void,
  handleNextPage?: () => void,
  handleFinish?: () => void,
  currentPage: number
}

const CardHOC = React.forwardRef<
  HTMLDivElement, 
  CardHOCProps
>(({WrappedComponent, handlePreviousPage, handleNextPage=() => {}, handleFinish=() => {}, currentPage}, ref) => (
  <div ref={ref}>
    {WrappedComponent}
    <div className="flex w-full justify-between items-center p-6 pt-0">
      <Button
      disabled={currentPage < 1}
      variant="secondary"
      onClick={handlePreviousPage}
      >
        <Icon className="h4 w-4 mr-2" path={mdiArrowLeft} />
        Previous
      </Button>

      {currentPage < 2 && (
        <Button
          className="ml-auto"
          variant="default"
          onClick={handleNextPage}
        >
          Next
          <Icon className="h4 w-4 ml-2" path={mdiArrowRight} />
        </Button>
      )}

      {currentPage === 2 && (
      <Button
        className="ml-auto"
        variant="default"
        onClick={handleFinish}
      >
        Start
        <Icon className="h4 w-4 ml-2" path={mdiCheck} />
      </Button>
    )}
    </div>
  </div>
));

export default CardHOC;