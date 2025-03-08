import { useOutsideClickEvent } from '@studio-freight/hamo'
import cn from 'clsx'
import { ComposableImage } from 'components/composable-image'
import { ScrollableBox } from 'components/scrollable-box'
import { useStore } from 'lib/store'
import { useEffect, useRef, useState } from 'react'
import s from './gallery.module.scss'

export function Gallery() {
  const contentRef = useRef(null)
  const [selectedProject, galleryVisible, setGalleryVisible] = useStore(
    (state) => [
      state.selectedProject,
      state.galleryVisible,
      state.setGalleryVisible,
    ],
  )
  const [hasAssets, setHasAssets] = useState(false)

  useOutsideClickEvent(contentRef, () => setGalleryVisible(false))

  useEffect(() => {
    const escFunction = (event) => {
      if (event.keyCode === 27) {
        setGalleryVisible(false)
      }
    }

    document.addEventListener('keydown', escFunction, false)
    return () => document.removeEventListener('keydown', escFunction, false)
  }, [])

  useEffect(() => {
    if (galleryVisible && selectedProject) {
      console.log('Gallery visible, selected project:', selectedProject)
      const hasValidAssets =
        selectedProject?.assetsCollection?.items?.length > 0 &&
        selectedProject.assetsCollection.items.some(
          (asset) => asset.imagesCollection?.items?.length > 0,
        )
      console.log('Has valid assets:', hasValidAssets)
      setHasAssets(hasValidAssets)
    }
  }, [galleryVisible, selectedProject])

  if (!selectedProject) {
    return null
  }

  return (
    <div className={cn(s.gallery, galleryVisible && s.visible)}>
      <button className={s.close} onClick={() => setGalleryVisible(false)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 26 26">
          <path
            stroke="var(--green)"
            d="M11 1H1v10M15 1h10v10M15 25h10V15M11 25H1V15m7.8-6.2 8.4 8.4m0-8.4-8.4 8.4"
          />
        </svg>
        <span className={cn(s.text, 'p-xs text-uppercase')}>Close</span>
      </button>
      <ScrollableBox className={s.scroller} reset={!galleryVisible}>
        {hasAssets ? (
          selectedProject.assetsCollection.items
            .filter((asset) => asset.imagesCollection?.items?.length > 0)
            .map((asset, i) => (
              <div key={i} ref={i === 0 ? contentRef : null}>
                <ComposableImage
                  sources={asset.imagesCollection}
                  width={1557}
                  height={916.5}
                  large
                  objectFit="cover"
                />
              </div>
            ))
        ) : (
          <div className={s.noAssets} ref={contentRef}>
            <p className="p text-uppercase">
              No images available for this project
            </p>
          </div>
        )}
      </ScrollableBox>
    </div>
  )
}
