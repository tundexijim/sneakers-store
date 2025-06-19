import { Trash2, Info, X } from "lucide-react";

// Delete Dialog Props
interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productId: string, imagePath: string) => void;
  title: string;
  message: string;
  productId: string;
  imagePath: string;
}

// Info Dialog Props
interface InfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

// Delete Confirmation Dialog
const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  productId,
  imagePath,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Trash2 className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="flex gap-3 p-6 pt-0 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(productId, imagePath)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Info Dialog (with just close button)
const InfoDialog: React.FC<InfoDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="flex justify-end p-6 pt-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export { DeleteDialog, InfoDialog };
