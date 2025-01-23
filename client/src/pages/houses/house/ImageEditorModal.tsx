import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import AvatarEditor from "react-avatar-editor";

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string | File;
  type: "logo" | "banner";
  editorRef: React.RefObject<AvatarEditor>;
  zoom: number;
  onZoomChange: (value: number | number[]) => void;
  onSave: () => void;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  onClose,
  image,
  type,
  editorRef,
  zoom,
  onZoomChange,
  onSave,
}) => {
  const editorProps =
    type === "logo"
      ? { width: 250, height: 250, borderRadius: 125 }
      : { width: 865, height: 200, borderRadius: 20 };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={type === "logo" ? "md" : "2xl"}
    >
      <ModalContent>
        <ModalHeader>Edit {type === "logo" ? "Logo" : "Banner"}</ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-center gap-6">
            <AvatarEditor
              ref={editorRef}
              image={image}
              {...editorProps}
              border={50}
              color={[255, 255, 255, 0.6]}
              scale={zoom}
              rotate={0}
            />
            <div className="w-full px-4">
              <p className="text-sm text-gray-500 mb-2">Zoom</p>

              <Slider
                aria-label="slider-ex-1"
                defaultValue={30}
                size="sm"
                step={0.1}
                max={type === "logo" ? 3 : 2}
                min={1}
                value={zoom}
                onChange={(value) =>
                  onZoomChange(Array.isArray(value) ? value[0] : value)
                }
                className="max-w-md"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button color="primary" onClick={() => onSave()}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
