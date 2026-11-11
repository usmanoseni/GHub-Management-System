import { useEffect, useState } from "react";
import { icons } from "../../../assets/asset";

interface QRScannerProps {
  onClose: () => void;
}

const QRScanner = ({ onClose }: QRScannerProps) => {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-2xl" >

        <button
          type="button"
          onClick={onClose}
          aria-label="Close QR scanner"
          className="absolute right-4 top-4 text-2xl cursor-pointer text-gray-500 hover:text-red-500"
        >
          &times;
        </button>

        <h2 className="mb-2 text-center text-xl font-bold text-[#082b3c]">
          Scan QR Code
        </h2>
   
            <p className="mb-5 text-center text-sm text-gray-500">
              Use your qr code scanner below.
            </p>
            <img src={icons.qrcode} alt="" />

      </div>
    </div>
  );
};

export default QRScanner;