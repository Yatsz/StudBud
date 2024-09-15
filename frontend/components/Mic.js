export default function MicButton({ onClick, isRecording }) {
    return (
        <div 
        className={`w-[93px] h-[93px] rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors duration-200 ${
          isRecording ? 'bg-[#FCEFB7]' : 'bg-gray-300'
        }`}
        onClick={onClick}
      >
        <svg width="21" height="29" viewBox="0 0 21 29" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.5 18.5C9.25 18.5 8.1875 18.0625 7.3125 17.1875C6.4375 16.3125 6 15.25 6 14V5C6 3.75 6.4375 2.6875 7.3125 1.8125C8.1875 0.9375 9.25 0.5 10.5 0.5C11.75 0.5 12.8125 0.9375 13.6875 1.8125C14.5625 2.6875 15 3.75 15 5V14C15 15.25 14.5625 16.3125 13.6875 17.1875C12.8125 18.0625 11.75 18.5 10.5 18.5ZM9 29V24.3875C6.4 24.0375 4.25 22.875 2.55 20.9C0.85 18.925 0 16.625 0 14H3C3 16.075 3.7315 17.844 5.1945 19.307C6.6575 20.77 8.426 21.501 10.5 21.5C12.574 21.499 14.343 20.7675 15.807 19.3055C17.271 17.8435 18.002 16.075 18 14H21C21 16.625 20.15 18.925 18.45 20.9C16.75 22.875 14.6 24.0375 12 24.3875V29H9Z" fill={isRecording ? 'blue' : 'black'}/>
        </svg>

      </div>
    );
  }