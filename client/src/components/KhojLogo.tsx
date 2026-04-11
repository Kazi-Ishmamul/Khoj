import { motion } from 'framer-motion';

const KhojLogo = () => {
    return (
        <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex items-center gap-3 cursor-pointer"
        >
            {/* Animated Logo Icon */}
            <div className="relative w-10 h-10">
                {/* Outer rotating circle */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 border-r-purple-600"
                />

                {/* Inner pulsing circle */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 opacity-60"
                />

                {/* Center dot */}
                <div className="absolute inset-3 rounded-full bg-white opacity-90" />

                {/* Glow effect */}
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-blue-400 blur-lg opacity-30"
                />
            </div>

            {/* Text Logo */}
            <div className="flex flex-col">
                <span className="text-lg font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent leading-none">
                    KHOJ
                </span>
                <span className="text-[10px] font-bold text-blue-500 tracking-wider">SEARCH</span>
            </div>
        </motion.div>
    );
};

export default KhojLogo;
