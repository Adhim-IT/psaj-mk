const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="w-full">
            <div>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
