import React, { useState, useRef, useEffect } from 'react';
import { Trophy, Plus, Trash2, RotateCcw, ChevronLeft, ChevronRight, Moon, Sun, List, Edit2 } from 'lucide-react';

export default function TournamentBracket() {
  // State management
  const [teams, setTeams] = useState(['Team 1', 'Team 2', 'Team 3', 'Team 4']);
  const [bracket, setBracket] = useState(null);
  const [newTeam, setNewTeam] = useState('');
  const [currentRound, setCurrentRound] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState('round');
  const [tournamentName, setTournamentName] = useState('My Tournament');
  const [isEditingName, setIsEditingName] = useState(false);
  const [useScoring, setUseScoring] = useState(false);
  const [editingTeamIdx, setEditingTeamIdx] = useState(null);
  const [editingTeamValue, setEditingTeamValue] = useState('');
  
  // Refs for swipe gestures
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Team management functions
  const addTeam = () => {
    if (newTeam.trim()) {
      setTeams([...teams, newTeam.trim()]);
      setNewTeam('');
    }
  };

  const removeTeam = (idx) => {
    setTeams(teams.filter((_, i) => i !== idx));
  };

  const startEditingTeam = (idx) => {
    setEditingTeamIdx(idx);
    setEditingTeamValue(teams[idx]);
  };

  const saveTeamEdit = () => {
    if (editingTeamValue.trim() && editingTeamIdx !== null) {
      const newTeams = [...teams];
      newTeams[editingTeamIdx] = editingTeamValue.trim();
      setTeams(newTeams);
    }
    setEditingTeamIdx(null);
    setEditingTeamValue('');
  };

  const cancelTeamEdit = () => {
    setEditingTeamIdx(null);
    setEditingTeamValue('');
  };

  // Bracket generation
  const generateBracket = () => {
    if (teams.length < 2) return;
    
    const size = Math.pow(2, Math.ceil(Math.log2(teams.length)));
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    
    const firstRound = [];
    for (let i = 0; i < size; i += 2) {
      firstRound.push({
        team1: shuffled[i] || null,
        team2: shuffled[i + 1] || null,
        winner: null,
        score1: 0,
        score2: 0
      });
    }
    
    // Auto-advance byes
    firstRound.forEach(match => {
      if (!match.team1 && match.team2) match.winner = match.team2;
      if (match.team1 && !match.team2) match.winner = match.team1;
    });
    
    const rounds = [firstRound];
    let currentRound = firstRound;
    
    while (currentRound.length > 1) {
      const nextRound = [];
      for (let i = 0; i < currentRound.length; i += 2) {
        nextRound.push({
          team1: null,
          team2: null,
          winner: null,
          score1: 0,
          score2: 0
        });
      }
      rounds.push(nextRound);
      currentRound = nextRound;
    }
    
    setBracket(rounds);
  };

  // Match winner selection
  const selectWinner = (roundIdx, matchIdx, team) => {
    const newBracket = JSON.parse(JSON.stringify(bracket));
    newBracket[roundIdx][matchIdx].winner = team;
    
    if (roundIdx < newBracket.length - 1) {
      const nextMatchIdx = Math.floor(matchIdx / 2);
      if (matchIdx % 2 === 0) {
        newBracket[roundIdx + 1][nextMatchIdx].team1 = team;
      } else {
        newBracket[roundIdx + 1][nextMatchIdx].team2 = team;
      }
    }
    
    setBracket(newBracket);
  };

  // Score updating
  const updateScore = (roundIdx, matchIdx, team, score) => {
    const newBracket = JSON.parse(JSON.stringify(bracket));
    const match = newBracket[roundIdx][matchIdx];
    
    if (team === match.team1) {
      match.score1 = parseInt(score) || 0;
    } else {
      match.score2 = parseInt(score) || 0;
    }
    
    setBracket(newBracket);
  };

  const reset = () => {
    setBracket(null);
    setCurrentRound(0);
  };

  // Touch/swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!bracket) return;
    
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && currentRound < bracket.length - 1) {
        setCurrentRound(currentRound + 1);
      } else if (diff < 0 && currentRound > 0) {
        setCurrentRound(currentRound - 1);
      }
    }
  };

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Theme classes
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-700';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const inputBg = darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300';
  const matchBg = darkMode ? 'bg-gray-700' : 'bg-gray-50';

  return (
    <div className={`min-h-screen ${bgClass} p-4 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`${cardBg} rounded-lg shadow-lg p-6 mb-6 transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-4">
            {isEditingName ? (
              <input
                type="text"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className={`text-2xl md:text-3xl font-bold ${inputBg} px-3 py-1 rounded border focus:ring-2 focus:ring-blue-500 flex-1`}
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-3 flex-1">
                <Trophy className="text-yellow-500" size={32} />
                <h1 className={`text-2xl md:text-3xl font-bold ${textPrimary}`}>
                  {tournamentName}
                </h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className={`${textMuted} hover:${textSecondary}`}
                >
                  <Edit2 size={20} />
                </button>
              </div>
            )}
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} p-2 rounded-lg transition-colors`}
            >
              {darkMode ? <Sun className="text-yellow-400" size={24} /> : <Moon className="text-gray-700" size={24} />}
            </button>
          </div>

          {!bracket ? (
            <div>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Add Teams
                </label>
                <input
                  type="text"
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTeam()}
                  placeholder="Enter team name"
                  className={`w-full px-4 py-2 border ${inputBg} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2 transition-all`}
                />
                <button
                  onClick={addTeam}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                >
                  <Plus size={20} />
                  Add Team
                </button>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useScoring}
                    onChange={(e) => setUseScoring(e.target.checked)}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className={`text-sm font-medium ${textSecondary}`}>
                    Enable Score Tracking
                  </span>
                </label>
              </div>

              <div className="mb-6">
                <h3 className={`font-medium ${textSecondary} mb-2`}>Teams ({teams.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {teams.map((team, idx) => (
                    <div key={idx} className={`flex items-center justify-between ${matchBg} p-3 rounded-lg transition-all hover:shadow-md`}>
                      {editingTeamIdx === idx ? (
                        <>
                          <input
                            type="text"
                            value={editingTeamValue}
                            onChange={(e) => setEditingTeamValue(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') saveTeamEdit();
                              if (e.key === 'Escape') cancelTeamEdit();
                            }}
                            onBlur={saveTeamEdit}
                            className={`flex-1 px-3 py-1 border ${inputBg} rounded focus:ring-2 focus:ring-blue-500 mr-2`}
                            autoFocus
                          />
                          <button
                            onClick={cancelTeamEdit}
                            className="text-red-500 hover:text-red-700 transition-colors px-2"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditingTeam(idx)}
                            className={`font-medium ${textPrimary} flex-1 text-left hover:${textSecondary} transition-colors`}
                          >
                            {team}
                          </button>
                          <button
                            onClick={() => removeTeam(idx)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={generateBracket}
                disabled={teams.length < 2}
                className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-lg transition-all transform hover:scale-105"
              >
                Generate Bracket
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw size={20} />
                Start Over
              </button>
              <button
                onClick={() => setView(view === 'round' ? 'tree' : 'round')}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 transition-all"
              >
                <List size={20} />
                {view === 'round' ? 'Tree View' : 'Round View'}
              </button>
            </div>
          )}
        </div>

        {/* Round View */}
        {bracket && view === 'round' && (
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`${cardBg} rounded-lg shadow-lg p-4 transition-all duration-300`}
          >
            {/* Navigation Controls */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentRound(Math.max(0, currentRound - 1))}
                disabled={currentRound === 0}
                className={`${darkMode ? 'bg-gray-700' : 'bg-gray-500'} text-white p-2 rounded-lg hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all`}
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="text-center flex-1">
                <h2 className={`text-xl md:text-2xl font-bold ${textPrimary}`}>
                  {currentRound === bracket.length - 1 ? 'Final' : `Round ${currentRound + 1}`}
                </h2>
                <p className={`text-sm ${textMuted}`}>
                  {currentRound + 1} of {bracket.length}
                </p>
              </div>
              
              <button
                onClick={() => setCurrentRound(Math.min(bracket.length - 1, currentRound + 1))}
                disabled={currentRound === bracket.length - 1}
                className={`${darkMode ? 'bg-gray-700' : 'bg-gray-500'} text-white p-2 rounded-lg hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all`}
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Matches */}
            <div className="space-y-4">
              {bracket[currentRound].map((match, matchIdx) => (
                <div key={matchIdx} className={`${matchBg} rounded-lg p-4 border-2 ${darkMode ? 'border-gray-600' : 'border-gray-200'} transition-all hover:shadow-lg`}>
                  <div className={`text-center ${textMuted} text-sm font-medium mb-3`}>
                    Match {matchIdx + 1}
                  </div>
                  
                  {match.team1 ? (
                    <div className="mb-2">
                      {!useScoring ? (
                        <button
                          onClick={() => !match.winner && selectWinner(currentRound, matchIdx, match.team1)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-all text-base font-medium ${
                            match.winner === match.team1
                              ? 'bg-green-500 text-white font-bold shadow-lg transform scale-105'
                              : match.winner
                              ? `${darkMode ? 'bg-gray-600' : 'bg-gray-200'} ${textMuted}`
                              : `${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-white hover:bg-blue-50'} border-2 ${darkMode ? 'border-gray-500' : 'border-gray-300'}`
                          }`}
                        >
                          {match.team1}
                        </button>
                      ) : (
                        <div
                          className={`w-full px-4 py-3 rounded-lg transition-all text-base font-medium ${
                            match.winner === match.team1
                              ? 'bg-green-500 text-white font-bold shadow-lg transform scale-105'
                              : match.winner
                              ? `${darkMode ? 'bg-gray-600' : 'bg-gray-200'} ${textMuted}`
                              : `${darkMode ? 'bg-gray-600' : 'bg-white'} border-2 ${darkMode ? 'border-gray-500' : 'border-gray-300'}`
                          }`}
                        >
                          <div className="flex justify-between items-center gap-3">
                            <span className="flex-1">{match.team1}</span>
                            <input
                              type="number"
                              value={match.score1}
                              onChange={(e) => updateScore(currentRound, matchIdx, match.team1, e.target.value)}
                              className={`w-16 text-center px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                            />
                            <button
                              onClick={() => !match.winner && selectWinner(currentRound, matchIdx, match.team1)}
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                match.winner === match.team1
                                  ? 'bg-white/20 text-white'
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              }`}
                              disabled={match.winner}
                            >
                              {match.winner === match.team1 ? '✓' : 'Win'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`w-full text-center px-4 py-3 rounded-lg mb-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} ${textMuted} italic`}>
                      TBD
                    </div>
                  )}
                  
                  <div className={`text-center ${textMuted} text-sm my-2`}>vs</div>
                  
                  {match.team2 ? (
                    <div>
                      {!useScoring ? (
                        <button
                          onClick={() => !match.winner && selectWinner(currentRound, matchIdx, match.team2)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-all text-base font-medium ${
                            match.winner === match.team2
                              ? 'bg-green-500 text-white font-bold shadow-lg transform scale-105'
                              : match.winner
                              ? `${darkMode ? 'bg-gray-600' : 'bg-gray-200'} ${textMuted}`
                              : `${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-white hover:bg-blue-50'} border-2 ${darkMode ? 'border-gray-500' : 'border-gray-300'}`
                          }`}
                        >
                          {match.team2}
                        </button>
                      ) : (
                        <div
                          className={`w-full px-4 py-3 rounded-lg transition-all text-base font-medium ${
                            match.winner === match.team2
                              ? 'bg-green-500 text-white font-bold shadow-lg transform scale-105'
                              : match.winner
                              ? `${darkMode ? 'bg-gray-600' : 'bg-gray-200'} ${textMuted}`
                              : `${darkMode ? 'bg-gray-600' : 'bg-white'} border-2 ${darkMode ? 'border-gray-500' : 'border-gray-300'}`
                          }`}
                        >
                          <div className="flex justify-between items-center gap-3">
                            <span className="flex-1">{match.team2}</span>
                            <input
                              type="number"
                              value={match.score2}
                              onChange={(e) => updateScore(currentRound, matchIdx, match.team2, e.target.value)}
                              className={`w-16 text-center px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                            />
                            <button
                              onClick={() => !match.winner && selectWinner(currentRound, matchIdx, match.team2)}
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                match.winner === match.team2
                                  ? 'bg-white/20 text-white'
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              }`}
                              disabled={match.winner}
                            >
                              {match.winner === match.team2 ? '✓' : 'Win'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`w-full text-center px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} ${textMuted} italic`}>
                      TBD
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {bracket[bracket.length - 1][0].winner && (
              <div className="mt-6 text-center animate-bounce">
                <div className={`inline-block ${darkMode ? 'bg-yellow-900 border-yellow-600' : 'bg-yellow-100 border-yellow-400'} border-4 rounded-lg p-6`}>
                  <Trophy className="inline-block text-yellow-500 mb-2" size={48} />
                  <h2 className={`text-2xl font-bold ${textPrimary}`}>Champion</h2>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {bracket[bracket.length - 1][0].winner}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tree View */}
        {bracket && view === 'tree' && (
          <div className={`${cardBg} rounded-lg shadow-lg p-4 overflow-x-auto transition-all duration-300`}>
            <div className="flex gap-8 min-w-max relative">
              {bracket.map((round, roundIdx) => {
                const baseMatchHeight = 100;
                const baseGap = 20;
                const multiplier = Math.pow(2, roundIdx);
                const totalHeight = baseMatchHeight + baseGap;
                
                return (
                  <div key={roundIdx} className="relative" style={{ minWidth: '180px' }}>
                    <h3 className={`text-center font-bold ${textSecondary} mb-4 text-xs md:text-sm`}>
                      {roundIdx === bracket.length - 1 ? 'Final' : `Round ${roundIdx + 1}`}
                    </h3>
                    
                    <div className="relative">
                      {round.map((match, matchIdx) => {
                        const topOffset = (matchIdx * multiplier * totalHeight) + ((multiplier - 1) * totalHeight / 2);
                        
                        return (
                          <div
                            key={matchIdx}
                            className="absolute"
                            style={{ 
                              top: `${topOffset}px`,
                              width: '180px'
                            }}
                          >
                            <div className={`${matchBg} rounded-lg p-3 border ${darkMode ? 'border-gray-600' : 'border-gray-200'} transition-all shadow-md`}>
                              {match.team1 ? (
                                <div
                                  className={`w-full text-left px-2 py-1.5 rounded mb-1 text-xs md:text-sm truncate ${
                                    match.winner === match.team1
                                      ? 'bg-green-500 text-white font-bold'
                                      : match.winner
                                      ? `${darkMode ? 'bg-gray-600' : 'bg-gray-200'} ${textMuted}`
                                      : `${darkMode ? 'bg-gray-600' : 'bg-white'} border ${darkMode ? 'border-gray-500' : 'border-gray-300'}`
                                  }`}
                                  title={match.team1}
                                >
                                  {match.team1}
                                </div>
                              ) : (
                                <div className={`w-full text-center px-2 py-1.5 rounded mb-1 text-xs italic ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} ${textMuted}`}>
                                  TBD
                                </div>
                              )}
                              <div className={`text-center ${textMuted} text-xs my-1`}>vs</div>
                              {match.team2 ? (
                                <div
                                  className={`w-full text-left px-2 py-1.5 rounded text-xs md:text-sm truncate ${
                                    match.winner === match.team2
                                      ? 'bg-green-500 text-white font-bold'
                                      : match.winner
                                      ? `${darkMode ? 'bg-gray-600' : 'bg-gray-200'} ${textMuted}`
                                      : `${darkMode ? 'bg-gray-600' : 'bg-white'} border ${darkMode ? 'border-gray-500' : 'border-gray-300'}`
                                  }`}
                                  title={match.team2}
                                >
                                  {match.team2}
                                </div>
                              ) : (
                                <div className={`w-full text-center px-2 py-1.5 rounded text-xs italic ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} ${textMuted}`}>
                                  TBD
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div style={{ height: `${round.length * multiplier * totalHeight}px` }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
