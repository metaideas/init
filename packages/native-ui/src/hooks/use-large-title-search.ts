import * as React from "react"
import type { LargeTitleHeaderProps } from "#components/large-title-header/types.ts"

function useLargeTitleSearch(searchBar: LargeTitleHeaderProps["searchBar"]) {
  const [searchValue, setSearchValue] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)
  const [isSearchBarShown, setIsSearchBarShown] = React.useState(false)

  function changeText(text: string) {
    setSearchValue(text)
    searchBar?.onChangeText?.(text)
  }

  return {
    blur: () => {
      setIsFocused(false)
      if (searchValue.length === 0) setIsSearchBarShown(false)
      searchBar?.onBlur?.()
    },
    cancel: () => {
      setIsSearchBarShown(false)
      changeText("")
    },
    changeText,
    focus: () => {
      setIsFocused(true)
      searchBar?.onFocus?.()
    },
    isOverlayShown: Boolean(searchBar?.content) && (isFocused || searchValue.length > 0),
    isSearchBarShown,
    searchValue,
    showSearchBar: () => {
      setIsSearchBarShown(true)
    },
  }
}

export { useLargeTitleSearch }
