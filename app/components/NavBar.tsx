import type React from 'react';
// Assuming AppView is defined in types.ts or a global types file
// For now, let's define it here or import if it exists in starter's context
import type { AppView } from '../../types';

interface NavBarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

// Importing the Button component we just created
import Button from './ui/Button';

const NavBar: React.FC<NavBarProps> = ({ currentView, onNavigate }) => {
  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl h-16 flex items-center justify-between px-8 relative max-w-md mx-auto border border-gray-100 dark:border-gray-700">
        <Button 
          variant="icon"
          icon="home"
          onClick={() => onNavigate('dashboard')}
          className={currentView === 'dashboard' ? 'text-primary' : 'text-gray-400'}
          aria-label="Dashboard"
        />
        <Button 
          variant="icon"
          icon="bar_chart"
          onClick={() => onNavigate('stats')}
          className={currentView === 'stats' ? 'text-primary' : 'text-gray-400'}
          aria-label="Stats"
        />
        <div className="relative -top-8">
          <Button 
            variant="fab"
            icon="add"
            onClick={() => onNavigate('add-task')}
            aria-label="Add Task"
          />
        </div>
        <Button 
          variant="icon"
          icon="settings_suggest"
          onClick={() => onNavigate('settings')}
          className={currentView === 'settings' ? 'text-primary' : 'text-gray-400'}
          aria-label="Settings"
        />
        <Button 
          variant="icon"
          icon="person"
          onClick={() => onNavigate('profile')}
          className={currentView === 'profile' ? 'text-primary' : 'text-gray-400'}
          aria-label="Profile"
        />
      </div>
    </div>
  );
};

export default NavBar;
