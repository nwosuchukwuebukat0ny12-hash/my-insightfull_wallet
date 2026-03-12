export const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
        </div>
    </div>
);
